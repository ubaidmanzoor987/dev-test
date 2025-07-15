/**
 * Available log levels for the application
 */
export enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
  Fatal = "fatal",
}

/**
 * Interface for logger methods
 */
export interface Logger {
  debug: (context: string, message: string, ...args: unknown[]) => void;
  info: (context: string, message: string, ...args: unknown[]) => void;
  warn: (context: string, message: string, ...args: unknown[]) => void;
  error: (
    context: string,
    message: string,
    error?: unknown,
    ...args: unknown[]
  ) => void;
  createContextLogger: (context: string) => ContextLogger;
}

/**
 * Interface for context-specific logger
 */
export interface ContextLogger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, error?: unknown, ...args: unknown[]) => void;
}
