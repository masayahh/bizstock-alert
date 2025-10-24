/**
 * Error Handling Utilities
 *
 * Centralized error handling and user-friendly error messages.
 */

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * App error with type and user-friendly message
 */
export class AppError extends Error {
  type: ErrorType;
  userMessage: string;
  originalError?: Error;

  constructor(
    type: ErrorType,
    userMessage: string,
    originalError?: Error,
    message?: string,
  ) {
    super(message || userMessage);
    this.type = type;
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.name = 'AppError';
  }
}

/**
 * Parse error and return user-friendly message
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Network error
  if (
    error instanceof Error &&
    (error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout'))
  ) {
    return new AppError(
      ErrorType.NETWORK,
      'ネットワークエラーが発生しました。接続を確認してください。',
      error,
    );
  }

  // OpenAI API rate limit
  if (error instanceof Error && error.message.includes('rate limit')) {
    return new AppError(
      ErrorType.RATE_LIMIT,
      'API利用制限に達しました。しばらく待ってから再試行してください。',
      error,
    );
  }

  // OpenAI API error
  if (
    error instanceof Error &&
    (error.message.includes('API') || error.message.includes('401'))
  ) {
    return new AppError(
      ErrorType.API,
      'APIエラーが発生しました。設定を確認してください。',
      error,
    );
  }

  // Validation error
  if (error instanceof Error && error.message.includes('validation')) {
    return new AppError(
      ErrorType.VALIDATION,
      '入力内容に誤りがあります。確認してください。',
      error,
    );
  }

  // Unknown error
  return new AppError(
    ErrorType.UNKNOWN,
    '予期しないエラーが発生しました。',
    error instanceof Error ? error : undefined,
    error instanceof Error ? error.message : String(error),
  );
}

/**
 * Log error to console (or remote logging service in production)
 */
export function logError(error: AppError, context?: string): void {
  console.error(
    `[${error.type}] ${context || 'Error'}:`,
    error.userMessage,
    error.originalError || error,
  );

  // In production, send to remote logging service
  // if (__DEV__ === false) {
  //   sendToLoggingService(error, context);
  // }
}

/**
 * Create retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Validate ticker code format
 */
export function validateTicker(ticker: string): boolean {
  // Japanese stock codes are 4 digits
  return /^\d{4}$/.test(ticker);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[^\w\s]/g, '');
}
