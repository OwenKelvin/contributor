import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type ILoginMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
}>;


export type ILoginMutation = { login: { accessToken: string, user: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, roles?: Array<{ id: string, name: string }> | null } } };

export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(loginInput: {email: $email, password: $password}) {
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
  export class ILoginGQL extends Apollo.Mutation<ILoginMutation, ILoginMutationVariables> {
    override document = LoginDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }