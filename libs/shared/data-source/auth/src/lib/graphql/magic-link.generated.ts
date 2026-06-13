/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IRequestMagicLinkMutationVariables = Exact<{
  email: string;
}>;


export type IRequestMagicLinkMutation = { requestMagicLink: boolean };

export type IMagicLinkLoginMutationVariables = Exact<{
  token: string;
  acceptTerms?: boolean | null | undefined;
}>;


export type IMagicLinkLoginMutation = { magicLinkLogin: { requiresTermsAcceptance: boolean | null, accessToken: string | null, user: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, roles: Array<{ id: string, name: string }> | null } | null } };

export const RequestMagicLinkDocument = gql`
    mutation RequestMagicLink($email: String!) {
  requestMagicLink(email: $email)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IRequestMagicLinkGQL extends Apollo.Mutation<IRequestMagicLinkMutation, IRequestMagicLinkMutationVariables> {
    override document = RequestMagicLinkDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MagicLinkLoginDocument = gql`
    mutation MagicLinkLogin($token: String!, $acceptTerms: Boolean) {
  magicLinkLogin(magicLinkLoginInput: {token: $token, acceptTerms: $acceptTerms}) {
    requiresTermsAcceptance
    accessToken
    user {
      id
      email
      firstName
      lastName
      phoneNumber
      roles {
        id
        name
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IMagicLinkLoginGQL extends Apollo.Mutation<IMagicLinkLoginMutation, IMagicLinkLoginMutationVariables> {
    override document = MagicLinkLoginDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }