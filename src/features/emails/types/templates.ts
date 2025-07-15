// ** Use this file to define the prop types for email templates. **
// This need to be added to the `EmailTemplatePropsMap` type in `templating.ts`
// and the `EmailTemplate` enum in `templating.ts` to be recognized by typescript.

import { z } from "zod";

// ** This is the core email template enum.
// It defines the available email templates in the application.
export enum EmailTemplate {
  WELCOME = "welcome",
}

// ** Basic Email properties schema and type
export const BasicEmailPropsSchema = z.object({
  title: z.string(),
  headerText: z.string(),
  bodyText: z.string(),
});
export type BasicEmailProps = z.infer<typeof BasicEmailPropsSchema>;

// ** Welcome Email properties schema and type
export const WelcomeEmailPropsSchema = z.object({
  name: z.string(),
});
export type WelcomeEmailProps = z.infer<typeof WelcomeEmailPropsSchema>;

// ** Email properties schema and type
// This is a discriminated union of all email props schemas
// allowing us to use a single type for all email props
export const EmailTemplatePropsSchema = z.union([
  BasicEmailPropsSchema,
  WelcomeEmailPropsSchema,
]);
export type EmailTemplateProps = z.infer<typeof EmailTemplatePropsSchema>;
