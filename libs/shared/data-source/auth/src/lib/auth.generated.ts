import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type ILoginMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
}>;


export type ILoginMutation = { login: { accessToken: string, user: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, roles?: Array<{ id: string, name: string }> | null } } };

export type IRegisterMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
  firstName: Types.Scalars['String']['input'];
  lastName: Types.Scalars['String']['input'];
}>;


export type IRegisterMutation = { register: { accessToken: string, user: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, roles?: Array<{ id: string, name: string }> | null } } };

export type IGoogleOAuthUrlQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type IGoogleOAuthUrlQuery = { googleOAuthUrl: { url: string } };

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
export const RegisterDocument = gql`
    mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
  register(
    registerInput: {lastName: $lastName, firstName: $firstName, email: $email, password: $password}
  ) {
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
  export class IRegisterGQL extends Apollo.Mutation<IRegisterMutation, IRegisterMutationVariables> {
    override document = RegisterDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GoogleOAuthUrlDocument = gql`
    query GoogleOAuthUrl {
  googleOAuthUrl {
    url
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGoogleOAuthUrlGQL extends Apollo.Query<IGoogleOAuthUrlQuery, IGoogleOAuthUrlQueryVariables> {
    override document = GoogleOAuthUrlDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }