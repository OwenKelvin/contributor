/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IBulkUpdateUserInput = {
  isActive?: boolean | null | undefined;
  roleIds?: Array<string | number> | null | undefined;
};

export type ICreateUserInput = {
  email: string;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  password: string;
  phoneNumber?: string | null | undefined;
  roleIds?: Array<string | number> | null | undefined;
};

export type ISortOrder =
  | 'ASC'
  | 'DESC';

export type IUpdateUserInput = {
  email?: string | null | undefined;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  password?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  roleIds?: Array<string | number> | null | undefined;
};

export type IUserFilter = {
  isActive?: boolean | null | undefined;
  roleId?: string | number | null | undefined;
  search?: string | null | undefined;
};

export type IUserPaginationInput = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
  sortBy?: string | null | undefined;
  sortOrder?: ISortOrder | null | undefined;
};

export type IGetAllUsersQueryVariables = Exact<{
  search?: string | null | undefined;
  filter?: Types.IUserFilter | null | undefined;
  pagination?: Types.IUserPaginationInput | null | undefined;
}>;


export type IGetAllUsersQuery = { getAllUsers: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, isBanned: boolean, createdAt: string, updatedAt: string, roles: Array<{ id: string, name: string, description: string | null }> | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type IGetUserByIdQueryVariables = Exact<{
  id: string | number;
}>;


export type IGetUserByIdQuery = { getUserById: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, isBanned: boolean, bannedAt: string | null, banReason: string | null, createdAt: string, updatedAt: string, bannedBy: { firstName: string | null, lastName: string | null, email: string } | null, roles: Array<{ id: string, name: string, description: string | null }> | null } };

export type IGetBannedUsersQueryVariables = Exact<{
  pagination?: Types.IUserPaginationInput | null | undefined;
}>;


export type IGetBannedUsersQuery = { getBannedUsers: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, bannedAt: string | null, banReason: string | null, createdAt: string, updatedAt: string, bannedBy: { email: string, firstName: string | null, lastName: string | null } | null, roles: Array<{ id: string, name: string, description: string | null }> | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type ICreateUserMutationVariables = Exact<{
  input: Types.ICreateUserInput;
}>;


export type ICreateUserMutation = { createUser: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, createdAt: string, updatedAt: string, roles: Array<{ id: string, name: string, description: string | null }> | null } };

export type IUpdateUserMutationVariables = Exact<{
  id: string | number;
  input: Types.IUpdateUserInput;
}>;


export type IUpdateUserMutation = { updateUser: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, createdAt: string, updatedAt: string, roles: Array<{ id: string, name: string, description: string | null }> | null } };

export type IAssignUserRoleMutationVariables = Exact<{
  userId: string | number;
  roleIds: Array<string | number> | string | number;
}>;


export type IAssignUserRoleMutation = { assignUserRole: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, createdAt: string, updatedAt: string, roles: Array<{ id: string, name: string, description: string | null }> | null } };

export type IDeleteUserMutationVariables = Exact<{
  id: string | number;
}>;


export type IDeleteUserMutation = { deleteUser: boolean };

export type IBulkUpdateUsersMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
  input: Types.IBulkUpdateUserInput;
}>;


export type IBulkUpdateUsersMutation = { bulkUpdateUsers: { success: boolean, successCount: number, failureCount: number, errors: Array<string> | null } };

export type IBanUserMutationVariables = Exact<{
  userId: string | number;
  reason?: string | null | undefined;
}>;


export type IBanUserMutation = { banUser: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, createdAt: string, updatedAt: string, roles: Array<{ id: string, name: string, description: string | null }> | null } };

export type IUnbanUserMutationVariables = Exact<{
  id: string | number;
}>;


export type IUnbanUserMutation = { unbanUser: { id: string, email: string, firstName: string | null, lastName: string | null, phoneNumber: string | null, createdAt: string, updatedAt: string, roles: Array<{ id: string, name: string, description: string | null }> | null } };

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
        isBanned
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
    isBanned
    bannedAt
    bannedBy {
      firstName
      lastName
      email
    }
    banReason
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
        bannedAt
        bannedBy {
          email
          firstName
          lastName
        }
        banReason
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
export const AssignUserRoleDocument = gql`
    mutation AssignUserRole($userId: ID!, $roleIds: [ID!]!) {
  assignUserRole(userId: $userId, roleIds: $roleIds) {
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
  export class IAssignUserRoleGQL extends Apollo.Mutation<IAssignUserRoleMutation, IAssignUserRoleMutationVariables> {
    override document = AssignUserRoleDocument;
    
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
    success
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