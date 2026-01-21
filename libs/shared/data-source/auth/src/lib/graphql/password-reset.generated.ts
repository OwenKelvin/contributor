import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IRequestPasswordResetMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
}>;


export type IRequestPasswordResetMutation = { requestPasswordReset: boolean };

export type IResetPasswordMutationVariables = Types.Exact<{
  token: Types.Scalars['String']['input'];
  newPassword: Types.Scalars['String']['input'];
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