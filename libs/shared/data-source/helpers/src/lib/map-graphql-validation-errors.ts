import { GraphQLError } from 'graphql/error';
import { FieldState, FieldTree, TreeValidationResult } from '@angular/forms/signals';
import { HttpErrorResponse } from '@angular/common/http';

export const mapGraphqlValidationErrors = <T>(errors: GraphQLError[] | HttpErrorResponse[], form: FieldTree<T>) => {
  const validationErrors = (errors as GraphQLError[]).flatMap(error => {
    const validationErrors = error.extensions?.['validationErrors'] as Record<string, string> | undefined;
    if (!validationErrors) return [];


    return Object.entries(validationErrors).map(([field, message]) => ({
      fieldTree: (form as T)[field as keyof T] as () => FieldState<unknown, string | number>,
      kind: 'server' as const,
      message,
    }));
  });

  if (validationErrors?.length > 0) {
    return validationErrors as TreeValidationResult
  } else {
    console.log({ errors });
    return  [
      {
        kind: 'server',
        message:
          (errors[0] as HttpErrorResponse)?.error?.message ??
          (errors[0] as Error).message ??
          'An unknown error occurred.',
        fieldTree: form,
      },
    ] as TreeValidationResult;
  }
};
