import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IGetAllProjectsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.IProjectFilter>;
  pagination?: Types.InputMaybe<Types.IProjectPaginationInput>;
}>;


export type IGetAllProjectsQuery = { getAllProjects: { projects: Array<{ id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetProjectByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type IGetProjectByIdQuery = { getProjectById: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } } };

export type IGetActiveProjectsQueryVariables = Types.Exact<{
  pagination?: Types.InputMaybe<Types.IProjectPaginationInput>;
}>;


export type IGetActiveProjectsQuery = { getActiveProjects: { projects: Array<{ id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetPendingProjectsQueryVariables = Types.Exact<{
  pagination?: Types.InputMaybe<Types.IProjectPaginationInput>;
}>;


export type IGetPendingProjectsQuery = { getPendingProjects: { projects: Array<{ id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type IGetArchivedProjectsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.IArchivedProjectFilter>;
  pagination?: Types.InputMaybe<Types.IProjectPaginationInput>;
}>;


export type IGetArchivedProjectsQuery = { getArchivedProjects: { projects: Array<{ id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type ICreateProjectMutationVariables = Types.Exact<{
  input: Types.ICreateProjectInput;
}>;


export type ICreateProjectMutation = { createProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } } };

export type IUpdateProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Types.IUpdateProjectInput;
}>;


export type IUpdateProjectMutation = { updateProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } } };

export type IDeleteProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type IDeleteProjectMutation = { deleteProject: boolean };

export type IBulkUpdateProjectsMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
  input: Types.IBulkUpdateInput;
}>;


export type IBulkUpdateProjectsMutation = { bulkUpdateProjects: { successCount: number, failureCount: number, errors?: Array<string> | null } };

export type IApproveProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  notes?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type IApproveProjectMutation = { approveProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } } };

export type IRejectProjectMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  reason: Types.Scalars['String']['input'];
}>;


export type IRejectProjectMutation = { rejectProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: any, endDate: any, status: Types.IProjectStatus, featuredImage?: string | null, createdAt: any, updatedAt: any, category: { id: string, name: string, description?: string | null } } };

export const GetAllProjectsDocument = gql`
    query GetAllProjects($search: String, $filter: ProjectFilter, $pagination: ProjectPaginationInput) {
  getAllProjects(search: $search, filter: $filter, pagination: $pagination) {
    projects {
      id
      title
      description
      detailedDescription
      goalAmount
      currentAmount
      startDate
      endDate
      status
      category {
        id
        name
        description
      }
      featuredImage
      createdAt
      updatedAt
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetAllProjectsGQL extends Apollo.Query<IGetAllProjectsQuery, IGetAllProjectsQueryVariables> {
    override document = GetAllProjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetProjectByIdDocument = gql`
    query GetProjectById($id: ID!) {
  getProjectById(id: $id) {
    id
    title
    description
    detailedDescription
    goalAmount
    currentAmount
    startDate
    endDate
    status
    category {
      id
      name
      description
    }
    featuredImage
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetProjectByIdGQL extends Apollo.Query<IGetProjectByIdQuery, IGetProjectByIdQueryVariables> {
    override document = GetProjectByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetActiveProjectsDocument = gql`
    query GetActiveProjects($pagination: ProjectPaginationInput) {
  getActiveProjects(pagination: $pagination) {
    projects {
      id
      title
      description
      detailedDescription
      goalAmount
      currentAmount
      startDate
      endDate
      status
      category {
        id
        name
        description
      }
      featuredImage
      createdAt
      updatedAt
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetActiveProjectsGQL extends Apollo.Query<IGetActiveProjectsQuery, IGetActiveProjectsQueryVariables> {
    override document = GetActiveProjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetPendingProjectsDocument = gql`
    query GetPendingProjects($pagination: ProjectPaginationInput) {
  getPendingProjects(pagination: $pagination) {
    projects {
      id
      title
      description
      detailedDescription
      goalAmount
      currentAmount
      startDate
      endDate
      status
      category {
        id
        name
        description
      }
      featuredImage
      createdAt
      updatedAt
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetPendingProjectsGQL extends Apollo.Query<IGetPendingProjectsQuery, IGetPendingProjectsQueryVariables> {
    override document = GetPendingProjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetArchivedProjectsDocument = gql`
    query GetArchivedProjects($filter: ArchivedProjectFilter, $pagination: ProjectPaginationInput) {
  getArchivedProjects(filter: $filter, pagination: $pagination) {
    projects {
      id
      title
      description
      detailedDescription
      goalAmount
      currentAmount
      startDate
      endDate
      status
      category {
        id
        name
        description
      }
      featuredImage
      createdAt
      updatedAt
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetArchivedProjectsGQL extends Apollo.Query<IGetArchivedProjectsQuery, IGetArchivedProjectsQueryVariables> {
    override document = GetArchivedProjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateProjectDocument = gql`
    mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    title
    description
    detailedDescription
    goalAmount
    currentAmount
    startDate
    endDate
    status
    category {
      id
      name
      description
    }
    featuredImage
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ICreateProjectGQL extends Apollo.Mutation<ICreateProjectMutation, ICreateProjectMutationVariables> {
    override document = CreateProjectDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateProjectDocument = gql`
    mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
  updateProject(id: $id, input: $input) {
    id
    title
    description
    detailedDescription
    goalAmount
    currentAmount
    startDate
    endDate
    status
    category {
      id
      name
      description
    }
    featuredImage
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IUpdateProjectGQL extends Apollo.Mutation<IUpdateProjectMutation, IUpdateProjectMutationVariables> {
    override document = UpdateProjectDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteProjectDocument = gql`
    mutation DeleteProject($id: ID!) {
  deleteProject(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IDeleteProjectGQL extends Apollo.Mutation<IDeleteProjectMutation, IDeleteProjectMutationVariables> {
    override document = DeleteProjectDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BulkUpdateProjectsDocument = gql`
    mutation BulkUpdateProjects($ids: [ID!]!, $input: BulkUpdateInput!) {
  bulkUpdateProjects(ids: $ids, input: $input) {
    successCount
    failureCount
    errors
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IBulkUpdateProjectsGQL extends Apollo.Mutation<IBulkUpdateProjectsMutation, IBulkUpdateProjectsMutationVariables> {
    override document = BulkUpdateProjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ApproveProjectDocument = gql`
    mutation ApproveProject($id: ID!, $notes: String) {
  approveProject(id: $id, notes: $notes) {
    id
    title
    description
    detailedDescription
    goalAmount
    currentAmount
    startDate
    endDate
    status
    category {
      id
      name
      description
    }
    featuredImage
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IApproveProjectGQL extends Apollo.Mutation<IApproveProjectMutation, IApproveProjectMutationVariables> {
    override document = ApproveProjectDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RejectProjectDocument = gql`
    mutation RejectProject($id: ID!, $reason: String!) {
  rejectProject(id: $id, reason: $reason) {
    id
    title
    description
    detailedDescription
    goalAmount
    currentAmount
    startDate
    endDate
    status
    category {
      id
      name
      description
    }
    featuredImage
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IRejectProjectGQL extends Apollo.Mutation<IRejectProjectMutation, IRejectProjectMutationVariables> {
    override document = RejectProjectDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }