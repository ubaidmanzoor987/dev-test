import { cleanup } from "@testing-library/react";
import { vi } from "vitest";

export const testSetupHelpers = {
  /**
   * Function to run before every test and set up the logger.
   * This captures console output and logs it when a test fails.
   * @param ctx - The test context, which will be used to store the cleanup function
   */
  globalSetup: () => {
    vi.resetAllMocks();
  },

  /**
   * Function to run after every test and clear up all nonsense and trickery.
   * @param ctx - The test context, which includes the cleanupLogger function
   */
  globalTeardown: () => {
    vi.clearAllMocks();
    cleanup(); // Clean up html elements created by React Testing Library
  },
};
