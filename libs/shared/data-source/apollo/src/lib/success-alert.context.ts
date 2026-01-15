import { ApolloLink } from '@apollo/client/core';
import { SHOW_SUCCESS_MESSAGE } from '@nyots/data-source/constants';
import { toast } from 'ngx-sonner';
import { map } from 'rxjs/operators';

export const contextSuccessAlert = () =>
  new ApolloLink((operation, forward) => {

    const showSuccessMessage =
      operation.getContext()[SHOW_SUCCESS_MESSAGE];

    return forward(operation).pipe(
      map((response) => {
        const res: Record<string, string> =
          Object.values(response.data ?? {})[0];

        if (showSuccessMessage && res?.['message']) {
          toast.success(res['message'], {
            duration: 5000,
          });
        }

        return response;
      })
    );
  });
