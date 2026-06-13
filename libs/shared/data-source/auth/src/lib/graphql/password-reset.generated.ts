/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IRequestPasswordResetMutationVariables = Exact<{
  email: string;
}>;


export type IRequestPasswordResetMutation = { requestPasswordReset: boolean };

export type IResetPasswordMutationVariables = Exact<{
  token: string;
  newPassword: string;
}>;


export type IResetPasswordMutation = { resetPassword: { accessToken: string, user: { id: string, email: string } } };

export const RequestPasswordResetDocument = gql`
    mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IRequestPasswordResetGQL extends Apollo.Mutation<IRequestPasswordResetMutation, IRequestPasswordResetMutationVariables> {
    override document = RequestPasswordResetDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ResetPasswordDocument = gql`
    mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(resetPasswordInput: {token: $token, newPassword: $newPassword}) {
    accessToken
    user {
      id
      email
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IResetPasswordGQL extends Apollo.Mutation<IResetPasswordMutation, IResetPasswordMutationVariables> {
    override document = ResetPasswordDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }