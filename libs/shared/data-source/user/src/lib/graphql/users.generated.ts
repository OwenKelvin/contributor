import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IGetAllUsersQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.IUserFilter>;
  pagination?: Types.InputMaybe<Types.IUserPaginationInput>;
}>;


export type IGetAllUsersQuery = { getAllUsers: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, createdAt: any, updatedAt: any, roles?: Array<{ id: string, name: string, description?: string | null }> | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetUserByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type IGetUserByIdQuery = { getUserById: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, createdAt: any, updatedAt: any, roles?: Array<{ id: string, name: string, description?: string | null }> | null } };

export type IGetBannedUsersQueryVariables = Types.Exact<{
  pagination?: Types.InputMaybe<Types.IUserPaginationInput>;
}>;


export type IGetBannedUsersQuery = { getBannedUsers: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, createdAt: any, updatedAt: any, roles?: Array<{ id: string, name: string, description?: string | null }> | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type ICreateUserMutationVariables = Types.Exact<{
  input: Types.ICreateUserInput;
}>;


export type ICreateUserMutation = { createUser: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, createdAt: any, updatedAt: any, roles?: Array<{ id: string, name: string, description?: string | null }> | null } };

export type IUpdateUserMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Types.IUpdateUserInput;
}>;


export type IUpdateUserMutation = { updateUser: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, createdAt: any, updatedAt: any, roles?: Array<{ id: string, name: string, description?: string | null }> | null } };

export type IDeleteUserMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type IDeleteUserMutation = { deleteUser: boolean };

export type IBulkUpdateUsersMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
  input: Types.IBulkUpdateUserInput;
}>;


export type IBulkUpdateUsersMutation = { bulkUpdateUsers: { successCount: number, failureCount: number, errors?: Array<string> | null } };

export type IBanUserMutationVariables = Types.Exact<{
  userId: Types.Scalars['ID']['input'];
  reason?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type IBanUserMutation = { banUser: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, createdAt: any, updatedAt: any, roles?: Array<{ id: string, name: string, description?: string | null }> | null } };

export type IUnbanUserMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type IUnbanUserMutation = { unbanUser: { id: string, email: string, firstName?: string | null, lastName?: string | null, phoneNumber?: string | null, createdAt: any, updatedAt: any, roles?: Array<{ id: string, name: string, description?: string | null }> | null } };

export const GetAllUsersDocument = gql`
    query GetAllUsers($search: String, $filter: UserFilter, $pagination: UserPaginationInput) {
  getAllUsers(search: $search, filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        email
        firstName
        lastName
        phoneNumber
        roles {
          id
          name
          description
        }
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
  export class IGetAllUsersGQL extends Apollo.Query<IGetAllUsersQuery, IGetAllUsersQueryVariables> {
    override document = GetAllUsersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetUserByIdDocument = gql`
    query GetUserById($id: ID!) {
  getUserById(id: $id) {
    id
    email
    firstName
    lastName
    phoneNumber
    roles {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetUserByIdGQL extends Apollo.Query<IGetUserByIdQuery, IGetUserByIdQueryVariables> {
    override document = GetUserByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetBannedUsersDocument = gql`
    query GetBannedUsers($pagination: UserPaginationInput) {
  getBannedUsers(pagination: $pagination) {
    edges {
      node {
        id
        email
        firstName
        lastName
        phoneNumber
        roles {
          id
          name
          description
        }
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
  export class IGetBannedUsersGQL extends Apollo.Query<IGetBannedUsersQuery, IGetBannedUsersQueryVariables> {
    override document = GetBannedUsersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    firstName
    lastName
    phoneNumber
    roles {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ICreateUserGQL extends Apollo.Mutation<ICreateUserMutation, ICreateUserMutationVariables> {
    override document = CreateUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    email
    firstName
    lastName
    phoneNumber
    roles {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IUpdateUserGQL extends Apollo.Mutation<IUpdateUserMutation, IUpdateUserMutationVariables> {
    override document = UpdateUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IDeleteUserGQL extends Apollo.Mutation<IDeleteUserMutation, IDeleteUserMutationVariables> {
    override document = DeleteUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BulkUpdateUsersDocument = gql`
    mutation BulkUpdateUsers($ids: [ID!]!, $input: BulkUpdateUserInput!) {
  bulkUpdateUsers(ids: $ids, input: $input) {
    successCount
    failureCount
    errors
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IBulkUpdateUsersGQL extends Apollo.Mutation<IBulkUpdateUsersMutation, IBulkUpdateUsersMutationVariables> {
    override document = BulkUpdateUsersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BanUserDocument = gql`
    mutation BanUser($userId: ID!, $reason: String) {
  banUser(input: {userId: $userId, reason: $reason}) {
    id
    email
    firstName
    lastName
    phoneNumber
    roles {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IBanUserGQL extends Apollo.Mutation<IBanUserMutation, IBanUserMutationVariables> {
    override document = BanUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UnbanUserDocument = gql`
    mutation UnbanUser($id: ID!) {
  unbanUser(id: $id) {
    id
    email
    firstName
    lastName
    phoneNumber
    roles {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IUnbanUserGQL extends Apollo.Mutation<IUnbanUserMutation, IUnbanUserMutationVariables> {
    override document = UnbanUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }