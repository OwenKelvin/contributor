import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IGetContributionsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.IContributionFilter>;
  pagination?: Types.InputMaybe<Types.IContributionPaginationInput>;
}>;


export type IGetContributionsQuery = { getContributions: { totalCount: number, totalAmount: number, edges: Array<{ cursor: string, node: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes?: string | null, paymentReference?: string | null, failureReason?: string | null, paidAt?: any | null, createdAt: any, updatedAt: any, user: { id: string, firstName?: string | null, lastName?: string | null, email: string }, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetContributionQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type IGetContributionQuery = { getContribution: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes?: string | null, paymentReference?: string | null, failureReason?: string | null, paidAt?: any | null, createdAt: any, updatedAt: any, user: { id: string, firstName?: string | null, lastName?: string | null, email: string }, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus }, transactions: Array<{ id: string, transactionType: Types.ITransactionType, amount: number, status: Types.ITransactionStatus, gatewayTransactionId?: string | null, gatewayResponse?: string | null, errorCode?: string | null, errorMessage?: string | null, createdAt: any }> } };

export type IGetMyContributionsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.IContributionFilter>;
  pagination?: Types.InputMaybe<Types.IContributionPaginationInput>;
}>;


export type IGetMyContributionsQuery = { getMyContributions: { totalCount: number, totalAmount: number, edges: Array<{ cursor: string, node: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes?: string | null, paymentReference?: string | null, failureReason?: string | null, paidAt?: any | null, createdAt: any, updatedAt: any, project: { id: string, title: string, description: string, goalAmount: number, currentAmount: number, status: Types.IProjectStatus, featuredImage?: string | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetProjectContributionsQueryVariables = Types.Exact<{
  projectId: Types.Scalars['String']['input'];
  filter?: Types.InputMaybe<Types.IContributionFilter>;
  pagination?: Types.InputMaybe<Types.IContributionPaginationInput>;
}>;


export type IGetProjectContributionsQuery = { getProjectContributions: { totalCount: number, totalAmount: number, edges: Array<{ cursor: string, node: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, notes?: string | null, paymentReference?: string | null, paidAt?: any | null, createdAt: any, updatedAt: any, user: { id: string, firstName?: string | null, lastName?: string | null, email: string } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetContributionReportQueryVariables = Types.Exact<{
  reportType: Types.IReportType;
  filter?: Types.InputMaybe<Types.IReportFilter>;
}>;


export type IGetContributionReportQuery = { getContributionReport: { totalContributions: number, totalAmount: number, pendingCount: number, pendingAmount: number, paidCount: number, paidAmount: number, failedCount: number, failedAmount: number, refundedCount: number, refundedAmount: number, successRate: number, topProjects: Array<{ projectId: string, projectTitle: string, totalAmount: number, contributionCount: number }>, topContributors: Array<{ userId: string, userName: string, userEmail: string, totalAmount: number, contributionCount: number }>, timeSeriesData: Array<{ date: string, contributionCount: number, totalAmount: number }> } };

export type IGetContributionTransactionsQueryVariables = Types.Exact<{
  contributionId: Types.Scalars['String']['input'];
}>;


export type IGetContributionTransactionsQuery = { getContributionTransactions: Array<{ id: string, transactionType: Types.ITransactionType, amount: number, status: Types.ITransactionStatus, gatewayTransactionId?: string | null, gatewayResponse?: string | null, errorCode?: string | null, errorMessage?: string | null, createdAt: any, contribution: { id: string, amount: number, paymentStatus: Types.IPaymentStatus } }> };

export type IGetTransactionsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ITransactionFilterInput>;
  pagination?: Types.InputMaybe<Types.IContributionPaginationInput>;
}>;


export type IGetTransactionsQuery = { getTransactions: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, transactionType: Types.ITransactionType, amount: number, status: Types.ITransactionStatus, gatewayTransactionId?: string | null, gatewayResponse?: string | null, errorCode?: string | null, errorMessage?: string | null, createdAt: any, contribution: { id: string, amount: number, paymentStatus: Types.IPaymentStatus, user: { id: string, firstName?: string | null, lastName?: string | null, email: string }, project: { id: string, title: string } } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export const GetContributionsDocument = gql`
    query GetContributions($filter: ContributionFilter, $pagination: ContributionPaginationInput) {
  getContributions(filter: $filter, pagination: $pagination) {
    edges {
      node {
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
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
    totalAmount
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetContributionsGQL extends Apollo.Query<IGetContributionsQuery, IGetContributionsQueryVariables> {
    override document = GetContributionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetContributionDocument = gql`
    query GetContribution($id: String!) {
  getContribution(id: $id) {
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
  export class IGetContributionGQL extends Apollo.Query<IGetContributionQuery, IGetContributionQueryVariables> {
    override document = GetContributionDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetMyContributionsDocument = gql`
    query GetMyContributions($filter: ContributionFilter, $pagination: ContributionPaginationInput) {
  getMyContributions(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        project {
          id
          title
          description
          goalAmount
          currentAmount
          status
          featuredImage
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
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
    totalAmount
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetMyContributionsGQL extends Apollo.Query<IGetMyContributionsQuery, IGetMyContributionsQueryVariables> {
    override document = GetMyContributionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetProjectContributionsDocument = gql`
    query GetProjectContributions($projectId: String!, $filter: ContributionFilter, $pagination: ContributionPaginationInput) {
  getProjectContributions(
    projectId: $projectId
    filter: $filter
    pagination: $pagination
  ) {
    edges {
      node {
        id
        user {
          id
          firstName
          lastName
          email
        }
        amount
        paymentStatus
        notes
        paymentReference
        paidAt
        createdAt
        updatedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
    totalAmount
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetProjectContributionsGQL extends Apollo.Query<IGetProjectContributionsQuery, IGetProjectContributionsQueryVariables> {
    override document = GetProjectContributionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetContributionReportDocument = gql`
    query GetContributionReport($reportType: ReportType!, $filter: ReportFilter) {
  getContributionReport(reportType: $reportType, filter: $filter) {
    totalContributions
    totalAmount
    pendingCount
    pendingAmount
    paidCount
    paidAmount
    failedCount
    failedAmount
    refundedCount
    refundedAmount
    successRate
    topProjects {
      projectId
      projectTitle
      totalAmount
      contributionCount
    }
    topContributors {
      userId
      userName
      userEmail
      totalAmount
      contributionCount
    }
    timeSeriesData {
      date
      contributionCount
      totalAmount
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetContributionReportGQL extends Apollo.Query<IGetContributionReportQuery, IGetContributionReportQueryVariables> {
    override document = GetContributionReportDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetContributionTransactionsDocument = gql`
    query GetContributionTransactions($contributionId: String!) {
  getContributionTransactions(contributionId: $contributionId) {
    id
    contribution {
      id
      amount
      paymentStatus
    }
    transactionType
    amount
    status
    gatewayTransactionId
    gatewayResponse
    errorCode
    errorMessage
    createdAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetContributionTransactionsGQL extends Apollo.Query<IGetContributionTransactionsQuery, IGetContributionTransactionsQueryVariables> {
    override document = GetContributionTransactionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetTransactionsDocument = gql`
    query GetTransactions($filter: TransactionFilterInput, $pagination: ContributionPaginationInput) {
  getTransactions(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        contribution {
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
          }
          amount
          paymentStatus
        }
        transactionType
        amount
        status
        gatewayTransactionId
        gatewayResponse
        errorCode
        errorMessage
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetTransactionsGQL extends Apollo.Query<IGetTransactionsQuery, IGetTransactionsQueryVariables> {
    override document = GetTransactionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }