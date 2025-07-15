import { vi } from "vitest";

// Create mock functions for logger methods
const mockContextLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Create a spy for the error handler
export const mockErrorHandler = vi
  .fn()
  .mockImplementation((operation, error, _options) => {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to ${operation}: ${message}`);
  });

// Create mock for the service context
export const mockServiceContext = {
  log: mockContextLogger,
  handleError: mockErrorHandler,
};

// Mock the createServiceContext function
export const mockCreateServiceContext = vi
  .fn()
  .mockReturnValue(mockServiceContext);

// Set up the module mock
vi.mock("@/utils/service-utils", () => ({
  createServiceContext: mockCreateServiceContext,
}));

// Export the mocks so they can be accessed in tests
export { mockContextLogger };
