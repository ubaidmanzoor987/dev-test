import { resendClient } from "@/lib/resend/client";
import { resendEmailAdapter } from "../adapters/resend-adapter";
import { userService } from "@/features/users";
import type { CreateEmailResponse } from "resend";
import {
  SendEmailPropsSchema,
  SendEmailTemplatePropsSchema,
  type SendEmailProps,
  type SendEmailWithTemplateProps,
} from "../types";
import {
  TemplateDataFetchers,
  TemplateProps,
  TemplateComponents,
  TemplateSubjects,
} from "../templates";
import type { EmailTemplate } from "../types/templates";
import { env } from "@/env";
import { createServiceContext } from "@/utils/service-utils";

// Create a service context for logging and error handling
const { log, handleError } = createServiceContext("EmailService");

/**
 * Application-specific email service
 * Handles business logic for emails
 */
export const emailService = {
  /**
   * Sends an email using the Resend service
   * @param props - Email properties including recipient, subject, and content
   * @returns {Promise<CreateEmailResponse>} Response from Resend service
   */
  sendEmail: async (
    props: Partial<SendEmailProps>,
  ): Promise<CreateEmailResponse> => {
    log.info("Sending email", { to: props.to, subject: props.subject });
    try {
      const validated = SendEmailPropsSchema.parse(props);
      // This adapter just puts whatever is in "content" into the correct
      // Resend field (html or react) so we can use the same api for both.
      return resendClient.sendEmail(resendEmailAdapter(validated));
    } catch (error) {
      return handleError("Sending email", error);
    }
  },

  /**
   * Sends an email using a predefined template
   * @param props - Properties including user ID and template type
   * @returns {Promise<CreateEmailResponse>} Response from Resend service
   */
  sendEmailTemplate: async (
    props: SendEmailWithTemplateProps,
  ): Promise<CreateEmailResponse> => {
    try {
      log.info("Sending email with template", {
        type: props.type,
        userId: props.userId,
      });

      // Parse the props to this funcition (throws if invalid)
      SendEmailTemplatePropsSchema.parse(props);
      const { type: template, userId } = props;

      // Grab the user and ensure they have an email
      const user = await userService.fetchUserById(userId);
      if (!user?.email) {
        throw new Error(
          `No email found for user ${userId} Cannot send ${template} email.`,
        );
      }

      // now we have our user, we can begin contructing the template
      const fetcher = TemplateDataFetchers[template as EmailTemplate];
      const schema = TemplateProps[template as EmailTemplate];
      const component = TemplateComponents[template as EmailTemplate];
      const subject = TemplateSubjects[template as EmailTemplate];

      // Bail if we're missing any of the core components
      if (!fetcher || !schema || !component || !subject) {
        throw new Error(`Template not found: ${template}`);
      }

      // Fetch and validate data required for constucting template
      const data = await fetcher(userId);
      const validatedData = schema.parse(data) as Record<string, unknown>;

      const emailData = {
        to: user.email,
        from: env.RESEND_FROM_EMAIL,
        subject,
        react: component,
        props: validatedData,
        text: "", // TODO: Add email-to-text helper
      };

      const result = emailService.sendEmail(emailData);

      log.info("Email sent successfully", { to: user.email, type: template });
      return result;
    } catch (error) {
      return handleError("Sending email with template", error);
    }
  },
};
