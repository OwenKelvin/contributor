import { GraphQLError } from 'graphql/error';

/**
 * Extracts a user-friendly error message from a GraphQL error or error object.
 * This is useful for displaying errors in components when the global error link
 * doesn't handle them (e.g., when you want to show inline errors).
 * 
 * @param error - The error object (can be GraphQL error, network error, or generic error)
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle GraphQL errors array
  if (typeof error === 'object' && 'errors' in error) {
    const errors = (error as { errors: GraphQLError[] }).errors;
    if (errors && errors.length > 0) {
      const firstError = errors[0];
      const errorCode = firstError.extensions?.['code'] as string | undefined;
      
      // Map error codes to user-friendly messages
      switch (errorCode) {
        case 'BAD_REQUEST':
          return 'Invalid request. Please check your input and try again.';
        case 'UNAUTHENTICATED':
          return 'Authentication required. Please log in to continue.';
        case 'FORBIDDEN':
          return 'You do not have permission to perform this action.';
        case 'NOT_FOUND':
          return 'The requested resource could not be found.';
        case 'CONFLICT':
          return 'This resource has been modified by another user. Please refresh and try again.';
        case 'UNPROCESSABLE_ENTITY':
          // Return the original message for business logic errors
          return firstError.message || 'Unable to process your request.';
        case 'BAD_GATEWAY':
          return 'Payment gateway error. Please try again later.';
        case 'INTERNAL_SERVER_ERROR':
          return 'Server error. Please try again later.';
        default:
          return firstError.message || 'An unexpected error occurred';
      }
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  // Fallback
  return 'An unexpected error occurred';
}

/**
 * Checks if an error contains validation errors from the backend.
 * 
 * @param error - The error object to check
 * @returns True if the error contains validation errors
 */
export function hasValidationErrors(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if ('errors' in error) {
    const errors = (error as { errors: GraphQLError[] }).errors;
    if (errors && errors.length > 0) {
      return errors.some(err => 
        err.extensions?.['validationErrors'] !== undefined
      );
    }
  }

  return false;
}

/**
 * Extracts validation errors from a GraphQL error.
 * 
 * @param error - The error object
 * @returns A record of field names to error messages, or null if no validation errors
 */
export function extractValidationErrors(error: unknown): Record<string, string> | null {
  if (!error || typeof error !== 'object' || !('errors' in error)) {
    return null;
  }

  const errors = (error as { errors: GraphQLError[] }).errors;
  if (!errors || errors.length === 0) {
    return null;
  }

  const validationErrors: Record<string, string> = {};
  
  errors.forEach(err => {
    const errValidations = err.extensions?.['validationErrors'] as Record<string, string> | undefined;
    if (errValidations) {
      Object.assign(validationErrors, errValidations);
    }
  });

  return Object.keys(validationErrors).length > 0 ? validationErrors : null;
}
