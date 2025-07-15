import { type ErrorHandlerOptions } from "@/types/errors";
import { LogLevel } from "@/types/logging";

/**
 * Standardized error handler for consistent error handling across the application
 *
 * @param context - The service/module where the error occurred
 * @param operation - The operation that failed
 * @param error - The original error
 * @param options - Additional options (custom messages, etc)
 * @returns Never returns, always throws
 */
export const handleError = (
  context: string,
  operation: string,
  error: unknown,
  options?: ErrorHandlerOptions,
): never => {
  const {
    customMessage,
    logLevel = "error",
    includeStack = true,
    rethrow = false,
  } = options ?? {};

  // Get the original error message
  const originalMessage =
    error instanceof Error ? error.message : String(error);

  // Create a consistent error message
  const message = customMessage ?? `Failed to ${operation}`;
  const fullMessage = `${message}: ${originalMessage}`;

  // Log with appropriate level and format
  const logPrefix = `[${context}]`;
  const logMessage = `${logPrefix} ${fullMessage}`;

  if (logLevel === LogLevel.Error || logLevel === LogLevel.Fatal) {
    console.error(logMessage);

    // Optionally log stack trace if error object has one
    if (includeStack && error instanceof Error && error.stack) {
      console.error(`${logPrefix} Stack trace:`, error.stack);
    }
  } else if (logLevel === LogLevel.Warn) {
    console.warn(logMessage);
  } else {
    console.info(logMessage);
  }

  // Either rethrow the original error or create a new one
  if (rethrow && error instanceof Error) {
    throw error;
  } else {
    throw new Error(fullMessage);
  }
};

/**
 * Creates a service-specific error handler that never returns
 *
 * @param serviceName - The name of the service
 * @returns A function that handles errors and always throws
 */
export const createErrorHandler = (serviceName: string) => {
  return function throwingErrorHandler(
    operation: string,
    error: unknown,
    options?: Parameters<typeof handleError>[3],
  ): never {
    return handleError(serviceName, operation, error, options);
  };
};
