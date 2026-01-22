import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  form,
  Field,
  required,
  minLength,
  submit,
  FieldTree,
} from '@angular/forms/signals';
import { GraphQLError } from 'graphql/error';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { ICategory, ICreateCategoryInput, IUpdateCategoryInput } from '@nyots/data-source';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';
import { CategoryService } from '@nyots/data-source/projects';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmDialogService } from '@nyots/ui/dialog';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmBadge } from '@nyots/ui/badge';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { firstValueFrom } from 'rxjs';

interface CategoryFormModel {
  name: string;
  description: string;
}

@Component({
  selector: 'nyots-project-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Field,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
    HlmBadge,
  ],
  templateUrl: './project-categories.component.html',
  styleUrls: ['./project-categories.component.scss'],
})
export class ProjectCategoriesComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly dialogService = inject(HlmDialogService);

  // State management
  categories = signal<ICategory[]>([]);
  isLoading = signal(false);

  // Form state
  isFormVisible = signal(false);
  editingCategoryId = signal<string | null>(null);

  // Form model
  private categoryModel = signal<CategoryFormModel>({
    name: '',
    description: '',
  });

  // Create form with validation schema
  protected readonly categoryForm = form(this.categoryModel, (form) => {
    // Name validation
    required(form.name, { message: 'Category name is required' });
    minLength(form.name, 2, { message: 'Name must be at least 2 characters' });

    // Description is optional, no validation needed
  });

  isSubmitting = computed(() =>  this.categoryForm().submitting() )

  // Computed properties
  isEditing = computed(() => this.editingCategoryId() !== null);
  formTitle = computed(() =>
    this.isEditing() ? 'Edit Category' : 'Add New Category'
  );
  submitButtonLabel = computed(() =>
    this.isEditing() ? 'Update Category' : 'Create Category'
  );

  constructor() {
    // Load categories on initialization
    this.loadCategories();
  }

  /**
   * Load all categories from the backend
   * Requirement 6.1, 6.2
   */
  async loadCategories() {
    this.isLoading.set(true);
    try {
      const categories = await this.categoryService.getAllCategories();
      this.categories.set((categories || []).filter((c): c is ICategory => c !== undefined));
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Show the category creation form
   * Requirement 6.3
   */
  showAddForm() {
    this.resetForm();
    this.isFormVisible.set(true);
    this.editingCategoryId.set(null);
  }

  /**
   * Show the category edit form with pre-populated data
   * Requirement 6.8
   */
  showEditForm(category: ICategory) {
    this.categoryModel.set({
      name: category.name || '',
      description: category.description || '',
    });
    this.isFormVisible.set(true);
    this.editingCategoryId.set(category.id);
  }

  /**
   * Hide the form and reset
   */
  hideForm() {
    this.isFormVisible.set(false);
    this.editingCategoryId.set(null);
    this.resetForm();
  }

  /**
   * Reset the form to initial state
   */
  private resetForm() {
    this.categoryModel.set({
      name: '',
      description: '',
    });
  }

  /**
   * Create a new category
   * Requirements 6.4, 6.5, 6.6, 6.7
   */
  private async createCategory(categoryForm: FieldTree<CategoryFormModel>) {
    try {
      const formValue = categoryForm().value();

      const input: ICreateCategoryInput = {
        name: formValue.name,
        description: formValue.description || undefined,
      };

      await this.categoryService.createCategory(input);

      console.log({ formValue });

      toast.success('Category created successfully');

      // Refresh categories list and hide form
      await this.loadCategories();
      this.hideForm();
    } catch (e) {
      // Handle GraphQL validation errors
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {

        if (graphqlError?.length > 0) {
          return mapGraphqlValidationErrors(graphqlError, categoryForm);
        }


        return [
          {
            kind: 'server',
            message:
              (e as HttpErrorResponse)?.error?.message ??
              (e as Error).message ??
              'An unknown error occurred.',
            fieldTree: categoryForm,
          },
        ];

      }

      // Handle other errors
      const errorMessage =
        (e as HttpErrorResponse)?.error?.message ??
        (e as Error).message ??
        'An unknown error occurred.';

      toast.error(errorMessage);

      return [
        {
          kind: 'server',
          message: errorMessage,
          fieldTree: categoryForm,
        },
      ];
    }

    return null;
  }

  /**
   * Update an existing category
   * Requirements 6.9, 6.10
   */
  private async updateCategory(categoryForm: FieldTree<CategoryFormModel>) {
    const categoryId = this.editingCategoryId();
    if (!categoryId) {
      toast.error('Invalid category ID');
      return null;
    }

    try {
      const formValue = categoryForm().value();

      const input: IUpdateCategoryInput = {
        name: formValue.name,
        description: formValue.description || undefined,
      };

      await this.categoryService.updateCategory(categoryId, input);
      toast.success('Category updated successfully');

      // Refresh categories list and hide form
      await this.loadCategories();
      this.hideForm();
    } catch (e) {
      // Handle GraphQL validation errors
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {
        // Check for uniqueness error
        const uniquenessError = graphqlError.find(err =>
          err.message.toLowerCase().includes('unique') ||
          err.message.toLowerCase().includes('already exists') ||
          err.message.toLowerCase().includes('duplicate')
        );

        if (uniquenessError) {
          toast.error('A category with this name already exists');
        }

        return mapGraphqlValidationErrors(graphqlError, categoryForm);
      }

      // Handle other errors
      const errorMessage =
        (e as HttpErrorResponse)?.error?.message ??
        (e as Error).message ??
        'An unknown error occurred.';

      toast.error(errorMessage);

      return [
        {
          kind: 'server',
          message: errorMessage,
          fieldTree: categoryForm,
        },
      ];
    }

    return null;
  }

  /**
   * Handle form submission (create or update)
   */
  async onSubmit() {
    await submit(this.categoryForm, async (fieldTree) => {
      if (this.isEditing()) {
        return await this.updateCategory(fieldTree);
      } else {
        return await this.createCategory(fieldTree);
      }
    });
  }

  /**
   * Delete a category with confirmation
   * Requirements 6.11, 6.12, 6.13
   */
  async onDeleteCategory(category: ICategory) {
    const confirmed = await this.showDeleteConfirmation(
      'Delete Category',
      `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await this.categoryService.deleteCategory(category.id);
        toast.success('Category deleted successfully');
        await this.loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to delete category: ${errorMessage}`);
      }
    }
  }

  /**
   * Show delete confirmation dialog
   */
  private async showDeleteConfirmation(
    title: string,
    message: string
  ): Promise<boolean> {
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title,
        message,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      },
    });

    const result = await firstValueFrom(dialogRef.closed$);
    return result === true;
  }
}
