import type { CreateEmailOptions } from "resend";
import type { ReactNode } from "react";
import { SendEmailPropsSchema, type SendEmailProps } from "../types";

/**
 * Helper function that adapts the SendEmailProps to the CreateEmailOptions
 * required by the Resend client. This allows us to use the same
 * SendEmailProps interface (html or React component content) across the application
 * while still conforming to the Resend client's requirements.
 * @param {SendEmailProps} props - The properties for sending an email.
 * @returns {CreateEmailOptions} - The adapted options for the Resend client.
 */
export const resendEmailAdapter = (
  props: Partial<SendEmailProps>,
): CreateEmailOptions => {
  SendEmailPropsSchema.parse(props); // Validate the props against the schema

  // Cache the content value and remove it from props
  const contentValue = props.content as string | ReactNode;
  delete props.content;

  const isReactNode = typeof contentValue !== "string";

  // If the content is a string, we can assume it's HTML content.
  const contentKey = isReactNode
    ? "react"
    : ("html" as keyof CreateEmailOptions);

  // Assign the content to the appropriate key and return the adapted options
  return { ...props, [contentKey]: contentValue } as CreateEmailOptions;
};
