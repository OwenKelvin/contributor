/**
 * Retry utility for handling failed async operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry an async operation with exponential backoff
 * @param fn The async function to retry
 * @param options Retry configuration options
 * @returns Promise that resolves with the function result or rejects after max attempts
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Call the retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Calculate delay with optional exponential backoff
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const err = error as any;

  // Check for common network error indicators
  return (
    err.name === 'NetworkError' ||
    err.message?.includes('Network') ||
    err.message?.includes('network') ||
    err.message?.includes('Failed to fetch') ||
    err.message?.includes('ERR_NETWORK') ||
    err.status === 0 ||
    err.statusCode === 0
  );
}

/**
 * Get a user-friendly error message from an error object
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  const err = error as any;

  // Network errors
  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }

  // GraphQL errors
  if (err.graphQLErrors && Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
    return err.graphQLErrors[0].message || 'A server error occurred';
  }

  // HTTP errors
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authorized. Please log in and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'A server error occurred. Please try again later.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return `An error occurred (${status}). Please try again.`;
    }
  }

  // Generic error message
  if (err.message) {
    return err.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
