import { Injectable } from '@angular/core';
// import { inject } from '@angular/core';
// import { firstValueFrom } from 'rxjs';
// import {
//   IGetAllCategoriesGQL,
//   ICreateCategoryGQL,
//   IUpdateCategoryGQL,
//   IDeleteCategoryGQL,
// } from './graphql/categories.generated';
import {
  ICreateCategoryInput,
  IUpdateCategoryInput,
} from './types';

/**
 * Service for managing category-related GraphQL operations.
 * 
 * Note: This service requires the GraphQL schema to be defined in the backend
 * and codegen to be run to generate the GQL service classes.
 * 
 * Run: npm run graphql-codegen:dataSource
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  // Uncomment these once codegen has been run
  // private getAllCategoriesGQL = inject(IGetAllCategoriesGQL);
  // private createCategoryGQL = inject(ICreateCategoryGQL);
  // private updateCategoryGQL = inject(IUpdateCategoryGQL);
  // private deleteCategoryGQL = inject(IDeleteCategoryGQL);

  async getAllCategories() {
    // Implementation will be added in task 3
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async createCategory(input: ICreateCategoryInput) {
    // Implementation will be added in task 3
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async updateCategory(id: string, input: IUpdateCategoryInput) {
    // Implementation will be added in task 3
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async deleteCategory(id: string) {
    // Implementation will be added in task 3
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }
}
