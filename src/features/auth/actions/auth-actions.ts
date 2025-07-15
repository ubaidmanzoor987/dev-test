import {
  auth,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "@/features/auth/handlers";

/**
 * Re-export the NextAuth stuff to maintain module structure
 * while working withing NextAuth's architecture.
 */
export const getSession = auth;
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut;
