import { env } from "@/env";

// Since production is set to true during the build process we can use it to
// determine if we're live; Production or Preview and set our cookie names accordingly.
const prodConfig = {
  csrfCookieName: "__Host-authjs.csrf-token",
  sessionCookieName: "__Secure-authjs.session-token",
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
};

const devConfig = {
  csrfCookieName: "authjs.csrf-token",
  sessionCookieName: "authjs.session-token",
  sessionMaxAge: 365 * 24 * 60 * 60, // 365 days
};

export const authConfig =
  env.NODE_ENV === "production" ? prodConfig : devConfig;
