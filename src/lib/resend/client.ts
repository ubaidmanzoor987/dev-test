import { type CreateEmailOptions, type CreateEmailResponse } from "resend";
import { createResendClient } from "./factory";

/**
 * Low-level Resend client for sending emails
 * Handles only the infrastructure concerns
 */
export const resendClient = {
  /**
   * Sends an email using the Resend client
   * @param props - The properties for sending the email
   * @returns A promise that resolves to the response from Resend
   */
  sendEmail: async (
    props: CreateEmailOptions,
  ): Promise<CreateEmailResponse> => {
    try {
      const client = createResendClient();
      return client.emails.send(props);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ResendClient] Error sending email: ${message}`);
      throw new Error(`Failed to send email: ${message}`);
    }
  },
};
