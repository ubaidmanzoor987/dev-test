import { env } from "@/env";
import { Resend } from "resend";

/**
 * Creates and configures a Resend client instance
 * Handles SDK instantiation and configuration
 */
export const createResendClient = (): Resend => {
  return new Resend(env.RESEND_API_KEY);
};
