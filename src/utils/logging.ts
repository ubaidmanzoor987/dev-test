import type { ContextLogger, Logger } from "@/types/logging";

/**
 * Application logger with various log levels and context support
 */
export const logger: Logger = {
  /**
   * Log debug message with context
   */
  debug: (context: string, message: string, ...args: unknown[]): void => {
    console.debug(`[${context}] ${message}`, ...args);
  },

  /**
   * Log info message with context
   */
  info: (context: string, message: string, ...args: unknown[]): void => {
    console.info(`[${context}] ${message}`, ...args);
  },

  /**
   * Log warning message with context
   */
  warn: (context: string, message: string, ...args: unknown[]): void => {
    console.warn(`[${context}] ${message}`, ...args);
  },

  /**
   * Log error message with context and optional error details
   */
  error: (
    context: string,
    message: string,
    error?: unknown,
    ...args: unknown[]
  ): void => {
    console.error(`[${context}] ${message}`, ...args);

    if (error instanceof Error && error.stack) {
      console.error(`[${context}] Stack trace:`, error.stack);
    } else if (error !== undefined) {
      console.error(`[${context}] Additional error info:`, error);
    }
  },

  /**
   * Create a logger with predefined context
   * @param context - The context string to prepend to log messages
   * @returns A context-specific logger
   */
  createContextLogger: (context: string): ContextLogger => ({
    debug: (message: string, ...args: unknown[]): void =>
      logger.debug(context, message, ...args),
    info: (message: string, ...args: unknown[]): void =>
      logger.info(context, message, ...args),
    warn: (message: string, ...args: unknown[]): void =>
      logger.warn(context, message, ...args),
    error: (message: string, error?: unknown, ...args: unknown[]): void =>
      logger.error(context, message, error, ...args),
  }),
};
