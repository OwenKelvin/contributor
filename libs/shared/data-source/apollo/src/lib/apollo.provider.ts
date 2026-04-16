import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache, split, from } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { OperationDefinitionNode } from 'graphql/language';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

import { contextSuccessAlert } from './success-alert.context';
import { BACKEND_URL } from '@nyots/data-source/constants';
import { contextAuthToken } from './auth-token.context';
import { errorLink } from './error-link.context';

export const apolloConfig = () => {
  const httpLink = inject(HttpLink);
  const backendUrl = inject(BACKEND_URL);
  const platformId = inject(PLATFORM_ID);

  const http = httpLink.create({
    uri: `${backendUrl ?? ''}/graphql`,
  });

  const isBrowser = isPlatformBrowser(platformId);

  const wsLink = isBrowser
    ? new GraphQLWsLink(
        createClient({
          url: `${backendUrl?.replace('http', 'ws')}/graphql`,
        }),
      )
    : null;

  const splitLink =
    wsLink &&
    split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(
          query,
        ) as OperationDefinitionNode;

        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      http,
    );

  const link = from([
    errorLink(),
    contextSuccessAlert(),
    contextAuthToken(),
    splitLink ?? http, // fallback for SSR
  ]);

  return {
    cache: new InMemoryCache(),
    link,
  };
};
