import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Mux environment variables
    MUX_TOKEN_ID: z.string().uuid(),
    MUX_TOKEN_SECRET: z.string().length(75),
    MUX_SIGNING_KEY_ID: z.string().length(45),
    MUX_SIGNING_KEY_SECRET: z
      .string()
      .min(200)
      .refine((val) => val.endsWith("==")),
    MUX_VIDEO_QUALITY: z.enum(["basic", "plus", "premium"]),
    MUX_WEBHOOK_SECRET: z.string().min(32),

    // Meilisearch environment variables
    MEILISEARCH_HOST: z.string().url(),
    MEILISEARCH_API_KEY: z.string(),

    // Resend environment variables
    RESEND_API_KEY: z.string().length(36),
    RESEND_TO_DEV_ADDRESS: z.string().email(),
    RESEND_FROM_EMAIL: z.string().refine((val) => {
      // The "from" email address can be in the format "Name <my@email.com>" or just "my@email.com".
      // We need to extract the email part and validate it.

      // If the value is already a valid email, return true.
      if (z.string().email().safeParse(val).success) {
        return true;
      }

      // If the value is not a valid email, try to extract the email part.
      const withoutQuotes = val.replace(/"/g, "");
      const withoutChevronRight = withoutQuotes.split(">")[0] ?? val;
      const email = withoutChevronRight.split("<")[1] ?? withoutChevronRight;

      return z.string().email().safeParse(email).success;
    }),
    TOLGEE_API_KEY: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
    MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET,
    MUX_SIGNING_KEY_ID: process.env.MUX_SIGNING_KEY_ID,
    MUX_SIGNING_KEY_SECRET: process.env.MUX_SIGNING_KEY_SECRET,
    MUX_VIDEO_QUALITY: process.env.MUX_VIDEO_QUALITY,
    MUX_WEBHOOK_SECRET: process.env.MUX_WEBHOOK_SECRET,
    MEILISEARCH_HOST: process.env.MEILISEARCH_HOST,
    MEILISEARCH_API_KEY: process.env.MEILISEARCH_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    RESEND_TO_DEV_ADDRESS: process.env.RESEND_TO_DEV_ADDRESS,
    TOLGEE_API_KEY: process.env.TOLGEE_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
