import * as React from "react";
import { Html, Body, Heading, Text, Head } from "@react-email/components";
import type { WelcomeEmailProps } from "./props";
import type { EmailTemplateProps } from "../../types/templates";

/**
 *
 * WelcomeEmail component is sent when a new user signs up to the app.
 *
 * Note: This compeonent must be exported as `default` to be recognized by the
 * react-email-renderer VSCode extension.
 *
 * @param {WelcomeEmailProps} props - The properties for the email template.
 * @returns {JSX.Element} The rendered email template.
 */
export default function WelcomeEmail(props: EmailTemplateProps) {
  const { name } = props as WelcomeEmailProps;

  return (
    <Html
      lang="en"
      style={{ backgroundColor: "white", fontFamily: "Arial, sans-serif" }}
    >
      <Head>
        <title>Welcome to Nomey!</title>
      </Head>

      <Heading as="h1" style={{ textAlign: "center", marginTop: "32px" }}>
        Welcome to Nomey, {name}!
      </Heading>

      <Body style={{ margin: 0, padding: 0 }}>
        <Heading as="h2" style={{ textAlign: "center", marginTop: "32px" }}>
          Glad to have you on board!
        </Heading>

        <Text
          style={{
            color: "#666666",
            fontSize: "22px",
            lineHeight: "1.5",
            textAlign: "center",
            margin: "32px 0",
          }}
        >
          Whether you&apos;re here to support your favourite creators or you
          plan to become one yourself, we&apos;re excited to have you join our
          community!
        </Text>
      </Body>
    </Html>
  );
}

/**
 * Preview properties for the DefaultEmail template.
 * These properties are used to render a sample email for testing purposes in the
 * react-email-renderer VSCode extension.
 * They must be exported as `PreviewProps` to be recognized by the extension.
 * https://marketplace.visualstudio.com/items?itemName=AbdoReda.react-email-renderer
 * @type {WelcomeEmailProps}
 */
export const PreviewProps: WelcomeEmailProps = {
  name: "Fake User",
};
