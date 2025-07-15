import { vi } from "vitest";

// Create a spy for the handleError function
export const handleError = vi
  .fn()
  .mockImplementation((context, operation, error) => {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to ${operation}: ${message}`);
  });

// Create a spy for the error handler returned by createErrorHandler
export const errorHandlerSpy = vi
  .fn()
  .mockImplementation((operation, error, _options) => {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to ${operation}: ${message}`);
  });

// Mock the createErrorHandler function to return our spy
export const createErrorHandler = vi.fn().mockReturnValue(errorHandlerSpy);

// Set up the module mock
vi.mock("@/utils/error-handlers", () => ({
  handleError,
  createErrorHandler,
}));
