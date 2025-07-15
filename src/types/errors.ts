import type { LogLevel } from "./logging";

export type ErrorHandlerOptions = {
  customMessage?: string;
  logLevel?: LogLevel;
  includeStack?: boolean;
  rethrow?: boolean;
  metadata?: Record<string, unknown>;
};
