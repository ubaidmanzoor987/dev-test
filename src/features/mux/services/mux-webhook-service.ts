import { muxClient } from "@/lib/mux/client";
import type { HeadersLike } from "@mux/mux-node/core.mjs";

export const muxWebhookService = {
  verifyWebhookEvent: async (body: string, headers: HeadersLike) => {
    // Check the request actually came from Mux.
    const isValid = muxClient.verifyWebhookSignature(body, headers);
    if (!isValid) {
      throw new Error("Invalid Mux signature");
    }

    // If it's valid, unwrap and return the webhook payload so we can deal with the content.
    return muxClient.unwrapWebhook(body, headers);
  },
};
