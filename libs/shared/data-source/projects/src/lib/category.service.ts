import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IGetAllCategoriesGQL,
  ICreateCategoryGQL,
  IUpdateCategoryGQL,
  IDeleteCategoryGQL,
} from './graphql/categories.generated';
import {
  ICreateCategoryInput,
  IUpdateCategoryInput,
} from '@nyots/data-source';

/**
 * Service for managing category-related GraphQL operations.
 * Follows the error handling pattern from AuthService.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private getAllCategoriesGQL = inject(IGetAllCategoriesGQL);
  private createCategoryGQL = inject(ICreateCategoryGQL);
  private updateCategoryGQL = inject(IUpdateCategoryGQL);
  private deleteCategoryGQL = inject(IDeleteCategoryGQL);

  /**
   * Retrieves all categories.
   * @returns Array of all categories
   */
  async getAllCategories() {
    const response = await firstValueFrom(
      this.getAllCategoriesGQL.watch().valueChanges
    );
    return response.data?.getAllCategories;
  }

  /**
   * Creates a new category.
   * @param input - Category creation input
   * @returns Created category
   */
  async createCategory(input: ICreateCategoryInput) {
    const response = await firstValueFrom(
      this.createCategoryGQL.mutate({
        variables: { input },
      })
    );
    return response.data?.createCategory;
  }

  /**
   * Updates an existing category.
   * @param id - Category ID
   * @param input - Category update input
   * @returns Updated category
   */
  async updateCategory(id: string, input: IUpdateCategoryInput) {
    const response = await firstValueFrom(
      this.updateCategoryGQL.mutate({
        variables: { id, input },
      })
    );
    return response.data?.updateCategory;
  }

  /**
   * Deletes a category.
   * @param id - Category ID
   * @returns Boolean indicating success
   */
  async deleteCategory(id: string) {
    const response = await firstValueFrom(
      this.deleteCategoryGQL.mutate({
        variables: { id },
      })
    );
    return response.data?.deleteCategory;
  }
}
