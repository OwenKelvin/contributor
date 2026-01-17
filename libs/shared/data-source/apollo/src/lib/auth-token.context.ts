import { ApolloLink } from '@apollo/client/core';

const ACCESS_TOKEN_KEY = 'accessToken';

// Extend Apollo's context type
interface ApolloContext {
  headers?: {
    cookie?: string;
    [key: string]: any;
  };
}

const isBrowser = typeof window !== 'undefined';

const getTokenFromLocalStorage = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getTokenFromCookie = (cookieString?: string): string | null => {
  const cookies = cookieString || (isBrowser ? document.cookie : '');
  const match = cookies.match(new RegExp(`(^| )${ACCESS_TOKEN_KEY}=([^;]+)`));
  return match ? match[2] : null;
};

export const contextAuthToken = () =>
  new ApolloLink((operation, forward) => {
    const context = operation.getContext() as ApolloContext;

    const token = isBrowser
      ? getTokenFromLocalStorage()
      : getTokenFromCookie(context.headers?.cookie);

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));

    return forward(operation);
  });
