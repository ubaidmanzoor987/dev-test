import { z } from "zod";

export const WelcomeEmailPropsSchema = z.object({ name: z.string() });
export type WelcomeEmailProps = z.infer<typeof WelcomeEmailPropsSchema>;
