import { env } from "@/env";
import { z } from "zod";
import { EmailTemplate } from "./templates";

export const SendEmailPropsSchema = z
  .object({
    to: z.union([z.string(), z.array(z.string())]),
    from: z.string().optional(),
    subject: z.string(),
    content: z.union([z.string(), z.any()]), // Accepts string or ReactNode
    text: z.string().optional(),
    tags: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
        }),
      )
      .optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    // Transform optional text to string with default value
    text: data.text ?? "This email does not have a text version.",
    // Add a default from address if not provided
    from: data.from ?? env.RESEND_FROM_EMAIL,
    // If it's dev mode send to dev address
    to: env.NODE_ENV === "production" ? data.to : env.RESEND_TO_DEV_ADDRESS,
  }));

export type SendEmailProps = z.infer<typeof SendEmailPropsSchema>;

export const SendEmailTemplatePropsSchema = z
  .object({
    userId: z.string(),
    type: z.nativeEnum(EmailTemplate),
  })
  .strict();
export type SendEmailWithTemplateProps = z.infer<
  typeof SendEmailTemplatePropsSchema
>;
