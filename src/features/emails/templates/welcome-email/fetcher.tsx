import type { WelcomeEmailProps } from "./props";

/**
 * Fetches data needed for the welcome email template
 */
export default async function fetcher(
  userId: string,
): Promise<WelcomeEmailProps> {
  // TODO: Implement after user service is ready
  return { name: `${userId}` };
}
