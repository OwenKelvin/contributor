import { onError } from '@apollo/client/link/error';
import { toast } from 'ngx-sonner';
import { GraphQLError } from 'graphql';

/**
 * Apollo error link that handles GraphQL and network errors globally.
 * Displays user-friendly error messages and logs errors for debugging.
 */
export const errorLink = () => {
  return onError(({ graphQLErrors, networkError, operation }: any) => {
    // Handle GraphQL errors
    if (graphQLErrors) {
      graphQLErrors.forEach((error: GraphQLError) => {
        const { message, extensions, path } = error;
        
        // Log error for debugging
        console.error(
          `[GraphQL error]: Message: ${message}, Path: ${path?.join(' > ')}`,
          {
            operation: operation.operationName,
            variables: operation.variables,
            extensions,
          }
        );

        // Extract error code and validation errors
        const errorCode = extensions?.['code'] as string | undefined;
        const validationErrors = extensions?.['validationErrors'] as Record<string, string> | undefined;

        // Don't show toast for validation errors (handled by form)
        if (validationErrors) {
          return;
        }

        // Map error codes to user-friendly messages
        let userMessage = message;
        let description: string | undefined;

        switch (errorCode) {
          case 'BAD_REQUEST':
            userMessage = 'Invalid request';
            description = 'Please check your input and try again.';
            break;
          case 'UNAUTHENTICATED':
            userMessage = 'Authentication required';
            description = 'Please log in to continue.';
            break;
          case 'FORBIDDEN':
            userMessage = 'Access denied';
            description = 'You do not have permission to perform this action.';
            break;
          case 'NOT_FOUND':
            userMessage = 'Resource not found';
            description = 'The requested resource could not be found.';
            break;
          case 'CONFLICT':
            userMessage = 'Conflict detected';
            description = 'This resource has been modified by another user. Please refresh and try again.';
            break;
          case 'UNPROCESSABLE_ENTITY':
            // Use the original message for business logic errors
            description = 'Please review the details and try again.';
            break;
          case 'BAD_GATEWAY':
            userMessage = 'Payment gateway error';
            description = 'There was an issue processing your payment. Please try again later.';
            break;
          case 'INTERNAL_SERVER_ERROR':
            userMessage = 'Server error';
            description = 'An unexpected error occurred. Please try again later.';
            break;
          default:
            // Use the original message if no specific mapping
            break;
        }

        // Display error toast
        toast.error(userMessage, {
          description,
          duration: 5000,
        });
      });
    }

    // Handle network errors
    if (networkError) {
      console.error('[Network error]:', networkError, {
        operation: operation.operationName,
        variables: operation.variables,
      });

      // Check if it's a timeout or connection error
      const isTimeout = networkError.message?.includes('timeout');
      const isConnectionError = networkError.message?.includes('Failed to fetch') || 
                                networkError.message?.includes('Network request failed');

      if (isTimeout) {
        toast.error('Request timeout', {
          description: 'The request took too long to complete. Please try again.',
          duration: 5000,
        });
      } else if (isConnectionError) {
        toast.error('Connection error', {
          description: 'Unable to connect to the server. Please check your internet connection.',
          duration: 5000,
        });
      } else {
        toast.error('Network error', {
          description: 'An unexpected network error occurred. Please try again.',
          duration: 5000,
        });
      }
    }
  });
};
