/**
 * Centralized error logging utility
 * Replaces console.error statements with proper error handling
 */

export interface ErrorLogData {
  message: string;
  error?: unknown;
  context?: Record<string, unknown> | undefined;
  timestamp?: Date;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLogData[] = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with optional context
   */
  logError(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorLog: ErrorLogData = {
      message,
      error,
      context,
      timestamp: new Date(),
    };

    // In development, still log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[ErrorLogger] ${message}`, error, context);
    }

    // Store error for potential reporting
    this.logs.push(errorLog);

    // In production, you could send errors to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error reporting service (e.g., Sentry, LogRocket)
      // this.reportToService(errorLog);
    }
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogData[] {
    return [...this.logs];
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export a singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience function for quick error logging
export const logError = (message: string, error?: unknown, context?: Record<string, unknown>): void => {
  errorLogger.logError(message, error, context);
};
