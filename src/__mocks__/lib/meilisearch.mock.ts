import { vi } from "vitest";

vi.mock("meilisearch");
vi.mock("@/config/melisearch", () => ({
  clientOptions: { host: "http://localhost:7700", apiKey: "test-key" },
}));

import { MeiliSearch } from "meilisearch";

export const MockedMeiliSearch = vi.mocked(MeiliSearch);
