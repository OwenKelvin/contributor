/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IArchivedProjectFilter = {
  archivedAfter?: string | null | undefined;
  archivedBefore?: string | null | undefined;
};

export type IBulkUpdateInput = {
  categoryId?: string | number | null | undefined;
  status?: IProjectStatus | null | undefined;
};

export type ICreateProjectInput = {
  categoryId: string | number;
  description: string;
  detailedDescription: string;
  endDate: string;
  featuredImage?: string | null | undefined;
  goalAmount: number;
  startDate: string;
  status: IProjectStatus;
  title: string;
};

export type IDateRangeInput = {
  end: string;
  start: string;
};

export type IProjectFilter = {
  categoryId?: string | number | null | undefined;
  dateRange?: IDateRangeInput | null | undefined;
  status?: IProjectStatus | null | undefined;
};

export type IProjectPaginationInput = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
};

export type IProjectStatus =
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'COMPLETED'
  | 'DRAFT'
  | 'PENDING';

export type IUpdateProjectInput = {
  categoryId?: string | number | null | undefined;
  description?: string | null | undefined;
  detailedDescription?: string | null | undefined;
  endDate?: string | null | undefined;
  featuredImage?: string | null | undefined;
  goalAmount?: number | null | undefined;
  startDate?: string | null | undefined;
  status?: IProjectStatus | null | undefined;
  title?: string | null | undefined;
};

export type IGetAllProjectsQueryVariables = Exact<{
  search?: string | null | undefined;
  filter?: Types.IProjectFilter | null | undefined;
  pagination?: Types.IProjectPaginationInput | null | undefined;
}>;


export type IGetAllProjectsQuery = { getAllProjects: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type IGetProjectByIdQueryVariables = Exact<{
  id: string | number;
}>;


export type IGetProjectByIdQuery = { getProjectById: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } };

export type IGetActiveProjectsQueryVariables = Exact<{
  pagination?: Types.IProjectPaginationInput | null | undefined;
}>;


export type IGetActiveProjectsQuery = { getActiveProjects: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type IGetPendingProjectsQueryVariables = Exact<{
  pagination?: Types.IProjectPaginationInput | null | undefined;
}>;


export type IGetPendingProjectsQuery = { getPendingProjects: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type IGetArchivedProjectsQueryVariables = Exact<{
  filter?: Types.IArchivedProjectFilter | null | undefined;
  pagination?: Types.IProjectPaginationInput | null | undefined;
}>;


export type IGetArchivedProjectsQuery = { getArchivedProjects: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type ICreateProjectMutationVariables = Exact<{
  input: Types.ICreateProjectInput;
}>;


export type ICreateProjectMutation = { createProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } };

export type IUpdateProjectMutationVariables = Exact<{
  id: string | number;
  input: Types.IUpdateProjectInput;
}>;


export type IUpdateProjectMutation = { updateProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } };

export type IDeleteProjectMutationVariables = Exact<{
  id: string | number;
}>;


export type IDeleteProjectMutation = { deleteProject: boolean };

export type IBulkUpdateProjectsMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
  input: Types.IBulkUpdateInput;
}>;


export type IBulkUpdateProjectsMutation = { bulkUpdateProjects: { successCount: number, failureCount: number, errors: Array<string> | null } };

export type IApproveProjectMutationVariables = Exact<{
  id: string | number;
  notes?: string | null | undefined;
}>;


export type IApproveProjectMutation = { approveProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } };

export type IRejectProjectMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type IRejectProjectMutation = { rejectProject: { id: string, title: string, description: string, detailedDescription: string, goalAmount: number, currentAmount: number, startDate: string, endDate: string, status: Types.IProjectStatus, featuredImage: string | null, createdAt: string, updatedAt: string, category: { id: string, name: string, description: string | null } } };

export const GetAllProjectsDocument = gql`
    query GetAllProjects($search: String, $filter: ProjectFilter, $pagination: ProjectPaginationInput) {
  getAllProjects(search: $search, filter: $filter, pagination: $pagination) {
    edges {
      node {
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
    edges {
      node {
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
  export class IGetActiveProjectsGQL extends Apollo.Query<IGetActiveProjectsQuery, IGetActiveProjectsQueryVariables> {
    override document = GetActiveProjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetPendingProjectsDocument = gql`
    query GetPendingProjects($pagination: ProjectPaginationInput) {
  getPendingProjects(pagination: $pagination) {
    edges {
      node {
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
  export class IGetPendingProjectsGQL extends Apollo.Query<IGetPendingProjectsQuery, IGetPendingProjectsQueryVariables> {
    override document = GetPendingProjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetArchivedProjectsDocument = gql`
    query GetArchivedProjects($filter: ArchivedProjectFilter, $pagination: ProjectPaginationInput) {
  getArchivedProjects(filter: $filter, pagination: $pagination) {
    edges {
      node {
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