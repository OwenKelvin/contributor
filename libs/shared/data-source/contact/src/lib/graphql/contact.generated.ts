/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IContactMessageInput = {
  email: string;
  message: string;
  name: string;
  subject: string;
};

export type ISendContactMessageMutationVariables = Exact<{
  input: Types.IContactMessageInput;
}>;


export type ISendContactMessageMutation = { sendContactMessage: boolean };

export const SendContactMessageDocument = gql`
    mutation SendContactMessage($input: ContactMessageInput!) {
  sendContactMessage(input: $input)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ISendContactMessageGQL extends Apollo.Mutation<ISendContactMessageMutation, ISendContactMessageMutationVariables> {
    override document = SendContactMessageDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }