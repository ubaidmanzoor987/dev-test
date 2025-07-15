import { env } from "@/env";
import type { Config } from "meilisearch";

export const clientOptions = {
  host: env.MEILISEARCH_HOST,
  apiKey: env.MEILISEARCH_API_KEY,
} satisfies Config;
