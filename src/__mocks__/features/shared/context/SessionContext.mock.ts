import { vi } from "vitest";

vi.mock("@/shared/context/SessionContext", () => ({
  useSession: vi.fn(() => ({
    user: { id: "default-id", name: "Default User" },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  })),
}));
