import { env } from "@/env";
import type { ClientOptions } from "@mux/mux-node";

export const clientOptions = {
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
  webhookSecret: env.MUX_WEBHOOK_SECRET,
} satisfies ClientOptions;
