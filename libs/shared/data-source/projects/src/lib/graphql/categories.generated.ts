/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type ICreateCategoryInput = {
  description?: string | null | undefined;
  name: string;
};

export type IUpdateCategoryInput = {
  description?: string | null | undefined;
  name?: string | null | undefined;
};

export type IGetAllCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type IGetAllCategoriesQuery = { getAllCategories: Array<{ id: string, name: string, description: string | null, projectCount: number, createdAt: string, updatedAt: string }> };

export type ICreateCategoryMutationVariables = Exact<{
  input: Types.ICreateCategoryInput;
}>;


export type ICreateCategoryMutation = { createCategory: { id: string, name: string, description: string | null, projectCount: number, createdAt: string, updatedAt: string } };

export type IUpdateCategoryMutationVariables = Exact<{
  id: string | number;
  input: Types.IUpdateCategoryInput;
}>;


export type IUpdateCategoryMutation = { updateCategory: { id: string, name: string, description: string | null, projectCount: number, createdAt: string, updatedAt: string } };

export type IDeleteCategoryMutationVariables = Exact<{
  id: string | number;
}>;


export type IDeleteCategoryMutation = { deleteCategory: boolean };

export const GetAllCategoriesDocument = gql`
    query GetAllCategories {
  getAllCategories {
    id
    name
    description
    projectCount
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IGetAllCategoriesGQL extends Apollo.Query<IGetAllCategoriesQuery, IGetAllCategoriesQueryVariables> {
    override document = GetAllCategoriesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateCategoryDocument = gql`
    mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    id
    name
    description
    projectCount
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ICreateCategoryGQL extends Apollo.Mutation<ICreateCategoryMutation, ICreateCategoryMutationVariables> {
    override document = CreateCategoryDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateCategoryDocument = gql`
    mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
  updateCategory(id: $id, input: $input) {
    id
    name
    description
    projectCount
    createdAt
    updatedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IUpdateCategoryGQL extends Apollo.Mutation<IUpdateCategoryMutation, IUpdateCategoryMutationVariables> {
    override document = UpdateCategoryDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteCategoryDocument = gql`
    mutation DeleteCategory($id: ID!) {
  deleteCategory(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IDeleteCategoryGQL extends Apollo.Mutation<IDeleteCategoryMutation, IDeleteCategoryMutationVariables> {
    override document = DeleteCategoryDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }