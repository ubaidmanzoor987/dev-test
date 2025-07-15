import { vi } from "vitest";

// Create mock functions for all logger methods
const mockDebug = vi.fn();
const mockInfo = vi.fn();
const mockWarn = vi.fn();
const mockError = vi.fn();

// Create mock for context logger methods
const mockContextLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock the createContextLogger to return our mock context logger
const mockCreateContextLogger = vi.fn().mockReturnValue(mockContextLogger);

// Mock the entire logger object
vi.mock("@/utils/logging", () => ({
  logger: {
    debug: mockDebug,
    info: mockInfo,
    warn: mockWarn,
    error: mockError,
    createContextLogger: mockCreateContextLogger,
  },
}));

// Export the mocks so they can be accessed in tests if needed
export {
  mockDebug,
  mockInfo,
  mockWarn,
  mockError,
  mockCreateContextLogger,
  mockContextLogger,
};
