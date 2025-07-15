import { lazy } from "react";
import type { ZodSchema } from "zod";
import { EmailTemplate, type EmailTemplateProps } from "../types/templates";
import welcomeFetcher from "../templates/welcome-email/fetcher";
import { WelcomeEmailPropsSchema } from "../templates/welcome-email/props";

/**
 * This file defines the mapping of email templates to their components,
 * data fetchers, props schemas, and subjects.
 * It allows for dynamic loading of email templates and their associated data.
 * The mappings are used in the email service to send emails with the correct templates.
 * Each template can have its own data fetching logic and props validation.
 */

// Type definitions for template mappings
type TemplateFetcher<T extends EmailTemplateProps> = (
  userId: string,
) => Promise<T>;

// Map of template names to their React components
export const TemplateComponents: Record<
  EmailTemplate,
  ReturnType<typeof lazy>
> = {
  [EmailTemplate.WELCOME]: lazy(
    () => import("../templates/welcome-email/template"),
  ),
};

// Map of template names to data fetcher functions
export const TemplateDataFetchers: Record<
  EmailTemplate,
  TemplateFetcher<EmailTemplateProps>
> = {
  [EmailTemplate.WELCOME]: welcomeFetcher,
};

// Map of template names to their props schemas
export const TemplateProps: Record<EmailTemplate, ZodSchema> = {
  [EmailTemplate.WELCOME]: WelcomeEmailPropsSchema,
};

// Map of template names to their email subjects
export const TemplateSubjects: Record<EmailTemplate, string> = {
  [EmailTemplate.WELCOME]: "Welcome to Nomey!",
};
