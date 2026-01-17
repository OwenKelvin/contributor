import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { OperationDefinitionNode } from 'graphql/language';
import { inject } from '@angular/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

import { contextSuccessAlert } from './success-alert.context';
import { BACKEND_URL } from '@nyots/data-source/constants';
import { contextAuthToken } from './auth-token.context';
import { errorLink } from './error-link.context';

export const apolloConfig = () => {
  const httpLink = inject(HttpLink)
  const backendUrl = inject(BACKEND_URL)

  const http = httpLink.create({
    uri: `${backendUrl ?? ''}/graphql`,
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${backendUrl
        ?.replace('http', 'ws')}/graphql`,
      retryAttempts: Infinity,
    })
  );

  const splitLink = split(
    ({ query }) => {
      const { kind, operation } =
        getMainDefinition(query) as OperationDefinitionNode;

      return (
        kind === 'OperationDefinition' &&
        operation === 'subscription'
      );
    },
    wsLink,
    http
  );

  const link = ApolloLink.from([
    errorLink(),
    contextSuccessAlert(),
    contextAuthToken(),
    splitLink,
  ]);

  return {
    cache: new InMemoryCache(),
    link,
  };
};
