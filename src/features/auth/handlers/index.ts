import NextAuth from "next-auth";
import { cache } from "react";

import { nextAuthConfig } from "../config/next-auth";

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth(nextAuthConfig);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
