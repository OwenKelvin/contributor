/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IActivityAction =
  | 'CATEGORY_CREATED'
  | 'CATEGORY_DELETED'
  | 'CATEGORY_UPDATED'
  | 'CONTRIBUTION_CREATED'
  | 'CONTRIBUTION_DELETED'
  | 'CONTRIBUTION_UPDATED'
  | 'PERMISSION_CREATED'
  | 'PERMISSION_DELETED'
  | 'PERMISSION_UPDATED'
  | 'PROJECT_APPROVED'
  | 'PROJECT_ARCHIVED'
  | 'PROJECT_CREATED'
  | 'PROJECT_DELETED'
  | 'PROJECT_REJECTED'
  | 'PROJECT_UPDATED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_CREATED'
  | 'ROLE_DELETED'
  | 'ROLE_REVOKED'
  | 'ROLE_UPDATED'
  | 'USER_CREATED'
  | 'USER_DELETED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_UPDATED';

export type IActivityDateRangeInput = {
  end: string;
  start: string;
};

export type IActivityFilter = {
  action?: IActivityAction | null | undefined;
  dateRange?: IActivityDateRangeInput | null | undefined;
  targetType?: ITargetType | null | undefined;
  userId?: string | number | null | undefined;
};

export type IActivityPaginationInput = {
  after?: string | null | undefined;
  first?: number | null | undefined;
};

export type ITargetType =
  | 'Category'
  | 'Contribution'
  | 'Permission'
  | 'Project'
  | 'Role'
  | 'User';

export type IGetActivitiesQueryVariables = Exact<{
  filter?: Types.IActivityFilter | null | undefined;
  pagination?: Types.IActivityPaginationInput | null | undefined;
}>;


export type IGetActivitiesQuery = { activities: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, action: Types.IActivityAction, targetId: string | null, targetType: Types.ITargetType | null, details: string | null, createdAt: string, updatedAt: string, user: { id: string, email: string, firstName: string | null, lastName: string | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type IGetActivityQueryVariables = Exact<{
  id: string | number;
}>;


export type IGetActivityQuery = { activity: { id: string, userId: string, action: Types.IActivityAction, targetId: string | null, targetType: Types.ITargetType | null, details: string | null, createdAt: string, updatedAt: string, user: { id: string, email: string, firstName: string | null, lastName: string | null } } | null };

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