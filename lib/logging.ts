// 🚀 StreetStashed Production Logging System
// Structured logging with multiple outputs and log levels

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  context: LogContext;
  error?: Error;
  stack?: string;
}

class Logger {
  private logLevel: string;
  private isProduction: boolean;
  private requestId: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || "info";
    this.isProduction = process.env.NODE_ENV === "production";
    this.requestId = this.generateRequestId();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warn", "error", "fatal"];
    const currentLevel = levels.indexOf(this.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= currentLevel;
  }

  private formatLog(entry: LogEntry): string {
    const baseLog: Record<string, unknown> = {
      timestamp: entry.timestamp,
      level: entry.level.toUpperCase(),
      message: entry.message,
      requestId: this.requestId,
      ...entry.context,
    };

    if (entry.error) {
      baseLog.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.stack || entry.error.stack,
      };
    }

    if (entry.context.metadata) {
      baseLog.metadata = entry.context.metadata;
    }

    return JSON.stringify(baseLog);
  }

  private async sendToExternalServices(entry: LogEntry): Promise<void> {
    try {
      // Send to external logging service (e.g., DataDog, LogRocket)
      if (process.env.EXTERNAL_LOGGING_ENDPOINT) {
        await fetch(process.env.EXTERNAL_LOGGING_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      }

      // Send critical errors to monitoring service
      if (entry.level === "fatal" && process.env.SENTRY_DSN) {
        await fetch(process.env.SENTRY_DSN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: "fatal",
            message: entry.message,
            extra: {
              context: entry.context,
              error: entry.error,
              stack: entry.stack,
            },
          }),
        });
      }
    } catch (error) {
      // Don't let logging failures break the application
      console.error("Failed to send log to external service:", error);
    }
  }

  private log(
    level: string,
    message: string,
    context: LogContext = {},
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level as LogEntry["level"],
      message,
      context: {
        ...context,
        requestId: this.requestId,
      },
      error,
      stack: error?.stack,
    };

    // Format and output log
    const formattedLog = this.formatLog(entry);

    // Console output
    if (this.isProduction) {
      // Production: structured JSON logging
      console.log(formattedLog);
    } else {
      // Development: human-readable logging
      const color = this.getColorForLevel(level);
      console.log(
        `${color}[${level.toUpperCase()}]${this.resetColor} ${message}`,
        context,
        error ? `\n${error.stack}` : "",
      );
    }

    // Send to external services asynchronously
    void this.sendToExternalServices(entry);
  }

  private getColorForLevel(level: string): string {
    const colors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      fatal: "\x1b[35m", // Magenta
    };
    return colors[level as keyof typeof colors] || this.resetColor;
  }

  private get resetColor(): string {
    return "\x1b[0m";
  }

  // Public logging methods
  debug(message: string, context: LogContext = {}): void {
    this.log("debug", message, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.log("info", message, context);
  }

  warn(message: string, context: LogContext = {}, error?: Error): void {
    this.log("warn", message, context, error);
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    this.log("error", message, context, error);
  }

  fatal(message: string, context: LogContext = {}, error?: Error): void {
    this.log("fatal", message, context, error);
  }

  // Context-aware logging methods
  withContext(context: LogContext): ContextualLogger {
    return new ContextualLogger(this, context);
  }

  // Request-specific logging
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  // Performance logging
  time(label: string): void {
    if (this.shouldLog("debug")) {
      console.time(`[PERF] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog("debug")) {
      console.timeEnd(`[PERF] ${label}`);
    }
  }

  // Business event logging
  logEvent(
    event: string,
    properties: Record<string, unknown> = {},
    context: LogContext = {},
  ): void {
    this.info(`Event: ${event}`, {
      ...context,
      metadata: {
        event,
        properties,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // API request logging
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context: LogContext = {},
  ): void {
    const level = statusCode >= 400 ? "error" : "info";
    this.log(level, `API Request: ${method} ${url}`, {
      ...context,
      metadata: {
        method,
        url,
        statusCode,
        duration: `${duration}ms`,
      },
    });
  }

  // Database query logging
  logQuery(sql: string, duration: number, context: LogContext = {}): void {
    if (this.shouldLog("debug")) {
      this.debug(`Database Query`, {
        ...context,
        metadata: {
          sql: sql.substring(0, 100) + (sql.length > 100 ? "..." : ""),
          duration: `${duration}ms`,
        },
      });
    }
  }

  // Payment logging
  logPayment(
    amount: number,
    currency: string,
    status: string,
    context: LogContext = {},
  ): void {
    const level = status === "failed" ? "error" : "info";
    this.log(level, `Payment ${status}`, {
      ...context,
      metadata: {
        amount,
        currency,
        status,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // User action logging
  logUserAction(
    action: string,
    userId: string,
    details: Record<string, unknown> = {},
    context: LogContext = {},
  ): void {
    this.info(`User Action: ${action}`, {
      ...context,
      userId,
      metadata: {
        action,
        details,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Contextual logger for chaining context
class ContextualLogger {
  private baseLogger: Logger;
  private context: LogContext;

  constructor(baseLogger: Logger, context: LogContext) {
    this.baseLogger = baseLogger;
    this.context = context;
  }

  debug(message: string, additionalContext: LogContext = {}): void {
    this.baseLogger.debug(message, { ...this.context, ...additionalContext });
  }

  info(message: string, additionalContext: LogContext = {}): void {
    this.baseLogger.info(message, { ...this.context, ...additionalContext });
  }

  warn(
    message: string,
    additionalContext: LogContext = {},
    error?: Error,
  ): void {
    this.baseLogger.warn(
      message,
      { ...this.context, ...additionalContext },
      error,
    );
  }

  error(
    message: string,
    additionalContext: LogContext = {},
    error?: Error,
  ): void {
    this.baseLogger.error(
      message,
      { ...this.context, ...additionalContext },
      error,
    );
  }

  fatal(
    message: string,
    additionalContext: LogContext = {},
    error?: Error,
  ): void {
    this.baseLogger.fatal(
      message,
      { ...this.context, ...additionalContext },
      error,
    );
  }

  withContext(additionalContext: LogContext): ContextualLogger {
    return new ContextualLogger(this.baseLogger, {
      ...this.context,
      ...additionalContext,
    });
  }
}

// Create and export logger instance
const logger = new Logger();

export default logger;

// Export types for external use
export type { LogContext, LogEntry };

// Export utility functions
export const createLogger = (context: LogContext) =>
  logger.withContext(context);

// Export request logger for API routes
export const createRequestLogger = (requestId: string, userId?: string) => {
  logger.setRequestId(requestId);
  return logger.withContext({ requestId, userId });
};

// Export component logger for React components
export const createComponentLogger = (
  componentName: string,
  userId?: string,
) => {
  return logger.withContext({ component: componentName, userId });
};

// Export business event logger
export const logBusinessEvent = (
  event: string,
  properties: Record<string, unknown> = {},
  context: LogContext = {},
) => {
  logger.logEvent(event, properties, context);
};

// Export performance logger
export const logPerformance = (
  label: string,
  duration: number,
  context: LogContext = {},
) => {
  logger.info(`Performance: ${label}`, {
    ...context,
    metadata: {
      label,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    },
  });
};
