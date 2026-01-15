import { GraphQLError } from 'graphql/error';
import { FieldState, FieldTree, TreeValidationResult } from '@angular/forms/signals';

export const mapGraphqlValidationErrors = <T>(errors: GraphQLError[], form: FieldTree<T>) => {
  return errors.flatMap(error => {
    const validationErrors = error.extensions?.['validationErrors'] as Record<string, string> | undefined;
    if (!validationErrors) return [];


    return Object.entries(validationErrors).map(([field, message]) => ({
      fieldTree: (form as T)[field as keyof T] as () => FieldState<unknown, string | number>,
      kind: 'server' as const,
      message,
    }));
  }) as TreeValidationResult;
};
