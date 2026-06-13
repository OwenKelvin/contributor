/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type ILoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type ILoginMutation = { login: { accessToken: string, user: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, roles: Array<{ id: string, name: string }> | null } } };

export type IRegisterMutationVariables = Exact<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}>;


export type IRegisterMutation = { register: { accessToken: string, user: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, roles: Array<{ id: string, name: string }> | null } } };

export type IGoogleLoginMutationVariables = Exact<{
  idToken: string;
}>;


export type IGoogleLoginMutation = { googleLogin: { accessToken: string, user: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, roles: Array<{ id: string, name: string }> | null } } };

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
export const GoogleLoginDocument = gql`
    mutation GoogleLogin($idToken: String!) {
  googleLogin(idToken: $idToken) {
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
  export class IGoogleLoginGQL extends Apollo.Mutation<IGoogleLoginMutation, IGoogleLoginMutationVariables> {
    override document = GoogleLoginDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }