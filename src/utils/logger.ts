/**
 * Professional logging system with multiple levels
 * Supports development and production modes
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  error?: Error;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDevelopment = __DEV__;

  /**
   * Log a debug message
   */
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning
   */
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * Log a fatal error
   */
  fatal(message: string, error?: Error, data?: any) {
    this.log(LogLevel.FATAL, message, data, error);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      error,
      stack: error?.stack,
    };

    // Store log entry
    this.logs.push(entry);

    // Limit stored logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      this.consoleLog(entry);
    }

    // In production, send to analytics/error tracking service
    if (
      !this.isDevelopment &&
      (level === LogLevel.ERROR || level === LogLevel.FATAL)
    ) {
      this.sendToErrorTracking(entry);
    }
  }

  /**
   * Output to console with formatting
   */
  private consoleLog(entry: LogEntry) {
    const prefix = `[${entry.timestamp.toISOString()}] [${entry.level}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.error || entry.data || '');
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  /**
   * Send error to tracking service (placeholder)
   */
  private sendToErrorTracking(entry: LogEntry) {
    // TODO: Integrate with error tracking service
    // Examples: Sentry, Bugsnag, Firebase Crashlytics
    // Sentry.captureException(entry.error, {
    //   level: entry.level.toLowerCase(),
    //   extra: entry.data,
    // });
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

export default logger;
