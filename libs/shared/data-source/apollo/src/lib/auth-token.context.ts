import { ApolloLink } from '@apollo/client/core';

const ACCESS_TOKEN_KEY = 'accessToken';

export const contextAuthToken = () =>
  new ApolloLink((operation, forward) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));

    return forward(operation);
  });
