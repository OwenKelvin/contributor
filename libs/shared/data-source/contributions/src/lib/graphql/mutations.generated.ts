/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IAdminCreateContributionInput = {
  amount: number;
  notes?: string | null | undefined;
  paymentReference?: string | null | undefined;
  paymentStatus: IPaymentStatus;
  projectId: string | number;
  sendEmail?: boolean | null | undefined;
  userId: string | number;
};

export type ICreateContributionInput = {
  amount: number;
  notes?: string | null | undefined;
  projectId: string | number;
};

export type IPaymentDetailsInput = {
  accountReference: string;
  phoneNumber: string;
  transactionDesc?: string | null | undefined;
};

export type IPaymentStatus =
  | 'FAILED'
  | 'PAID'
  | 'PENDING'
  | 'REFUNDED';

export type IProjectStatus =
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'COMPLETED'
  | 'DRAFT'
  | 'PENDING';

export type ITransactionStatus =
  | 'FAILED'
  | 'PENDING'
  | 'SUCCESS';

export type ITransactionType =
  | 'PAYMENT'
  | 'REFUND';

export type ICreateContributionMutationVariables = Exact<{
  input: Types.ICreateContributionInput;
}>;


export type ICreateContributionMutation = { createContribution: { success: boolean, message: string, data: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes: string | null, paymentReference: string | null, failureReason: string | null, paidAt: string | null, createdAt: string, updatedAt: string, user: { id: string, firstName: string | null, lastName: string | null, email: string }, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus } } } };

export type IAdminCreateContributionMutationVariables = Exact<{
  input: Types.IAdminCreateContributionInput;
}>;


export type IAdminCreateContributionMutation = { adminCreateContribution: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes: string | null, paymentReference: string | null, failureReason: string | null, paidAt: string | null, createdAt: string, updatedAt: string, user: { id: string, firstName: string | null, lastName: string | null, email: string }, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus } } };

export type IProcessContributionPaymentMutationVariables = Exact<{
  contributionId: string;
  paymentDetails: Types.IPaymentDetailsInput;
}>;


export type IProcessContributionPaymentMutation = { processContributionPayment: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes: string | null, paymentReference: string | null, failureReason: string | null, paidAt: string | null, createdAt: string, updatedAt: string, user: { id: string, firstName: string | null, lastName: string | null, email: string }, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus }, transactions: Array<{ id: string, transactionType: Types.ITransactionType, amount: number, status: Types.ITransactionStatus, gatewayTransactionId: string | null, gatewayResponse: string | null, errorCode: string | null, errorMessage: string | null, createdAt: string }> } };

export type IUpdateContributionStatusMutationVariables = Exact<{
  contributionId: string;
  status: Types.IPaymentStatus;
  reason?: string | null | undefined;
}>;


export type IUpdateContributionStatusMutation = { updateContributionStatus: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes: string | null, paymentReference: string | null, failureReason: string | null, paidAt: string | null, createdAt: string, updatedAt: string, user: { id: string, firstName: string | null, lastName: string | null, email: string }, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus } } };

export type IProcessContributionRefundMutationVariables = Exact<{
  contributionId: string;
  reason: string;
}>;


export type IProcessContributionRefundMutation = { processContributionRefund: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes: string | null, paymentReference: string | null, failureReason: string | null, paidAt: string | null, createdAt: string, updatedAt: string, user: { id: string, firstName: string | null, lastName: string | null, email: string }, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus }, transactions: Array<{ id: string, transactionType: Types.ITransactionType, amount: number, status: Types.ITransactionStatus, gatewayTransactionId: string | null, gatewayResponse: string | null, errorCode: string | null, errorMessage: string | null, createdAt: string }> } };

export type IBulkUpdateContributionStatusMutationVariables = Exact<{
  contributionIds: Array<string> | string;
  status: Types.IPaymentStatus;
  reason?: string | null | undefined;
}>;


export type IBulkUpdateContributionStatusMutation = { bulkUpdateContributionStatus: { successCount: number, failureCount: number, errors: Array<{ contributionId: string, error: string }> } };

export const CreateContributionDocument = gql`
    mutation CreateContribution($input: CreateContributionInput!) {
  createContribution(input: $input) {
    success
    message
    data {
      id
      user {
        id
        firstName
        lastName
        email
      }
      project {
        id
        title
        description
        goalAmount
        currentAmount
        status
      }
      amount
      paymentStatus
      notes
      paymentReference
      failureReason
      paidAt
      createdAt
      updatedAt
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ICreateContributionGQL extends Apollo.Mutation<ICreateContributionMutation, ICreateContributionMutationVariables> {
    override document = CreateContributionDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const AdminCreateContributionDocument = gql`
    mutation AdminCreateContribution($input: AdminCreateContributionInput!) {
  adminCreateContribution(input: $input) {
    id
    user {
      id
      firstName
      lastName
      email
    }
    project {
      id
      title
      description
      goalAmount
      currentAmount
      status
    }
    amount
    paymentStatus
    notes
    paymentReference
    failureReason
    paidAt
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IAdminCreateContributionGQL extends Apollo.Mutation<IAdminCreateContributionMutation, IAdminCreateContributionMutationVariables> {
    override document = AdminCreateContributionDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ProcessContributionPaymentDocument = gql`
    mutation ProcessContributionPayment($contributionId: String!, $paymentDetails: PaymentDetailsInput!) {
  processContributionPayment(
    contributionId: $contributionId
    paymentDetails: $paymentDetails
  ) {
    id
    user {
      id
      firstName
      lastName
      email
    }
    project {
      id
      title
      description
      goalAmount
      currentAmount
      status
    }
    amount
    paymentStatus
    notes
    paymentReference
    failureReason
    paidAt
    transactions {
      id
      transactionType
      amount
      status
      gatewayTransactionId
      gatewayResponse
      errorCode
      errorMessage
      createdAt
    }
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IProcessContributionPaymentGQL extends Apollo.Mutation<IProcessContributionPaymentMutation, IProcessContributionPaymentMutationVariables> {
    override document = ProcessContributionPaymentDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateContributionStatusDocument = gql`
    mutation UpdateContributionStatus($contributionId: String!, $status: PaymentStatus!, $reason: String) {
  updateContributionStatus(
    contributionId: $contributionId
    status: $status
    reason: $reason
  ) {
    id
    user {
      id
      firstName
      lastName
      email
    }
    project {
      id
      title
      description
      goalAmount
      currentAmount
      status
    }
    amount
    paymentStatus
    notes
    paymentReference
    failureReason
    paidAt
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IUpdateContributionStatusGQL extends Apollo.Mutation<IUpdateContributionStatusMutation, IUpdateContributionStatusMutationVariables> {
    override document = UpdateContributionStatusDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ProcessContributionRefundDocument = gql`
    mutation ProcessContributionRefund($contributionId: String!, $reason: String!) {
  processContributionRefund(contributionId: $contributionId, reason: $reason) {
    id
    user {
      id
      firstName
      lastName
      email
    }
    project {
      id
      title
      description
      goalAmount
      currentAmount
      status
    }
    amount
    paymentStatus
    notes
    paymentReference
    failureReason
    paidAt
    transactions {
      id
      transactionType
      amount
      status
      gatewayTransactionId
      gatewayResponse
      errorCode
      errorMessage
      createdAt
    }
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IProcessContributionRefundGQL extends Apollo.Mutation<IProcessContributionRefundMutation, IProcessContributionRefundMutationVariables> {
    override document = ProcessContributionRefundDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BulkUpdateContributionStatusDocument = gql`
    mutation BulkUpdateContributionStatus($contributionIds: [String!]!, $status: PaymentStatus!, $reason: String) {
  bulkUpdateContributionStatus(
    contributionIds: $contributionIds
    status: $status
    reason: $reason
  ) {
    successCount
    failureCount
    errors {
      contributionId
      error
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IBulkUpdateContributionStatusGQL extends Apollo.Mutation<IBulkUpdateContributionStatusMutation, IBulkUpdateContributionStatusMutationVariables> {
    override document = BulkUpdateContributionStatusDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }