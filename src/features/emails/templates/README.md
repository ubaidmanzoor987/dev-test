# Email Templates

This directory contains email templates used by the Nomey application. Our email system uses [React Email](https://react.email/) for templating and [Resend](https://resend.com) as the email delivery service.

## Architecture

The email system consists of several components:

- **Templates**: React components that define the HTML structure of emails
- **Props**: Type definitions and validation schemas for template data
- **Fetchers**: Functions that retrieve necessary data for populating templates
- **Service**: Central service for sending emails with or without templates

## Directory Structure

Each email template is organized in its own directory with the following files:

```
email-type/
├── fetcher.tsx - Function to fetch data needed for the template
├── props.tsx   - TypeScript types and Zod validation schema
└── template.tsx - React component that renders the email
```

## Creating a New Email Template

To create a new email template:

1. Create a new directory in `src/features/emails/templates` with the name of your template
2. Create the following files:
   - `props.tsx`: Define your template's data schema with Zod and export types
   - `template.tsx`: Create your React Email template component
   - `fetcher.tsx`: Implement the data fetcher function

3. Add your template to the configuration in `src/features/emails/templates/index.ts`:
   - Add a new entry in the `EmailTemplate` enum
   - Register the component, fetcher, schema, and subject

### Example: Props File

```typescript
import { z } from "zod";

export const YourEmailPropsSchema = z.object({
  // Define your props schema here
  name: z.string(),
});
export type YourEmailProps = z.infer<typeof YourEmailPropsSchema>;
```

### Example: Template File

```tsx
import * as React from "react";
import { Html, Body, Heading, Text, Head } from "@react-email/components";
import type { YourEmailProps } from "./props";
import type { EmailProps } from "../../types/email-props";

export default function YourEmail(props: EmailProps) {
  const { name } = props as YourEmailProps;

  return (
    <Html>
      <Head>
        <title>Your Email Title</title>
      </Head>
      <Body>
        <Heading>Hello, {name}!</Heading>
        <Text>Your email content here</Text>
      </Body>
    </Html>
  );
}

// Preview props for React Email renderer extension
export const PreviewProps: YourEmailProps = {
  name: "Preview User",
};
```

### Example: Fetcher File

```typescript
import type { YourEmailProps } from "./props";

export default async function fetcher(userId: string): Promise<YourEmailProps> {
  // Fetch relevant data using the userId
  return { name: "User Name" };
}
```

## Using Email Templates

To send an email using a template:

```typescript
import { emailService } from "@/features/emails/services/email-service";
import { EmailTemplate } from "@/config/email";

// Send email with template
await emailService.sendEmailWithTemplate({
  type: EmailTemplate.YOUR_TEMPLATE_NAME,
  userId: "user-id-here",
});
```

## Development

### VS Code Email Viewer extension

With the "React Email Viewer" extension installed, you can export a `const PreviewProps` variable
and view the email live in your code editor. The email _must_ be the default export for this to work.

```typescript
export const PreviewProps: WelcomeEmailProps = {
  name: "Fake User",
};
```

### Notes:

- All emails in development mode are sent to the development email address defined in `RESEND_TO_DEV_ADDRESS` environment variable
- Use the React Email Renderer VSCode extension to preview templates
- Test templates by sending them to your development email
