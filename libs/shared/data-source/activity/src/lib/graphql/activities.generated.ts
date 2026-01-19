import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IGetActivitiesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.IActivityFilter>;
  pagination?: Types.InputMaybe<Types.IActivityPaginationInput>;
}>;


export type IGetActivitiesQuery = { activities: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, action: Types.IActivityAction, targetId?: string | null, targetType?: Types.ITargetType | null, details?: string | null, createdAt: any, updatedAt: any, user: { id: string, email: string, firstName?: string | null, lastName?: string | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetActivityQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type IGetActivityQuery = { activity?: { id: string, userId: string, action: Types.IActivityAction, targetId?: string | null, targetType?: Types.ITargetType | null, details?: string | null, createdAt: any, updatedAt: any, user: { id: string, email: string, firstName?: string | null, lastName?: string | null } } | null };

export const GetActivitiesDocument = gql`
    query GetActivities($filter: ActivityFilter, $pagination: ActivityPaginationInput) {
  activities(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        userId
        user {
          id
          email
          firstName
          lastName
        }
        action
        targetId
        targetType
        details
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
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetActivitiesGQL extends Apollo.Query<IGetActivitiesQuery, IGetActivitiesQueryVariables> {
    override document = GetActivitiesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetActivityDocument = gql`
    query GetActivity($id: ID!) {
  activity(id: $id) {
    id
    userId
    user {
      id
      email
      firstName
      lastName
    }
    action
    targetId
    targetType
    details
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetActivityGQL extends Apollo.Query<IGetActivityQuery, IGetActivityQueryVariables> {
    override document = GetActivityDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }