// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { type DefaultSession, type NextAuthConfig } from "next-auth";
// import DiscordProvider from "next-auth/providers/discord";

// import { db } from "@/lib/db";

// /**
//  * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
//  * object and keep type safety.
//  *
//  * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
//  */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       // ...other properties
//       // role: UserRole;
//     } & DefaultSession["user"];
//   }

//   // interface User {
//   //   // ...other properties
//   //   // role: UserRole;
//   // }
// }

// /**
//  * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
//  *
//  * @see https://next-auth.js.org/configuration/options
//  */
// export const nextAuthConfig = {
//   providers: [
//     DiscordProvider,
//     /**
//      * ...add more providers here.
//      *
//      * Most other providers require a bit more work than the Discord provider. For example, the
//      * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
//      * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
//      *
//      * @see https://next-auth.js.org/providers/github
//      */
//   ],
//   adapter: PrismaAdapter(db),
//   callbacks: {
//     session: ({ session, user }) => ({
//       ...session,
//       user: {
//         ...session.user,
//         id: user.id,
//       },
//     }),
//   },
// } satisfies NextAuthConfig;


import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { paths } from "@/config/routes";
import { getRedis } from "@/lib/redis";
import { RedisService } from "@/features/redis";

export const nextAuthConfig = {
  providers: [
    DiscordProvider,
    // ... other providers
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    // The redirect callback should only handle URL validation and redirection
    redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow URLs of the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Default to home page
      return paths.homePage;
    },
    // Handle successful sign in
    signIn: async ({ user }) => {
      if (!user) return false;
      
      try {
        // Create Redis channels for the user
        const redis = await getRedis();
        const redisService = new RedisService(redis);
        // Set up user's personal channel
        const userChannel = RedisService.getUserChannel(user.id ?? '');
        await redisService.setValue(`channels:${user.id}`, userChannel);
        
        // Add user to global channel subscribers list
        const globalChannel = RedisService.getGlobalChannel();
        await redisService.hSet('global:subscribers', user.id ?? '', Date.now().toString());
        
        return true;
      } catch (error) {
        console.error('Error setting up Redis channels:', error);
        return true; // Still allow sign in even if Redis setup fails
      }
    }
  },
} satisfies NextAuthConfig;