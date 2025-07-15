// Import our test libraries
import { afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Import any required config
import { SETUP_TIMEOUT_MILLIS, TEARDOWN_TIMEOUT_MILLIS } from "@/config/test";

// Register global setup and teardown hooks
import { testSetupHelpers } from "./helpers/setup";
beforeEach(testSetupHelpers.globalSetup, SETUP_TIMEOUT_MILLIS);
afterEach(testSetupHelpers.globalTeardown, TEARDOWN_TIMEOUT_MILLIS);
