import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  form,
  Field,
  required,
  minLength,
  maxLength,
  validate,
  submit,
  FieldTree,
} from '@angular/forms/signals';
import { GraphQLError } from 'graphql/error';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { IUpdateProjectInput, IProjectStatus, ICategory } from '@nyots/data-source';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';
import { ProjectService } from '@nyots/data-source/projects';
import { CategoryService } from '@nyots/data-source/projects';
import { ProjectFormComponent, ProjectFormModel } from '../../components/project-form/project-form.component';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { getUserFriendlyErrorMessage } from '../../utils/retry.util';

@Component({
  selector: 'nyots-edit-project',
  standalone: true,
  imports: [
    Field,
    ProjectFormComponent,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
  ],
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss'],
})
export class EditProjectComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Project ID from route
  private projectId = signal<string | null>(null);

  // Form model with initial values
  private projectModel = signal<ProjectFormModel>({
    title: '',
    description: '',
    goalAmount: 0,
    startDate: null,
    endDate: null,
    categoryId: '',
    featuredImage: null,
    detailedDescription: '',
    status: IProjectStatus.Draft,
  });

  // Create form with validation schema (same as CreateProjectComponent)
  protected projectForm = form(this.projectModel, (form) => {
    // Title validation
    required(form.title, { message: 'Title is required' });
    minLength(form.title, 3, { message: 'Title must be at least 3 characters' });
    maxLength(form.title, 200, { message: 'Title must not exceed 200 characters' });

    // Description validation
    required(form.description, { message: 'Description is required' });
    minLength(form.description, 10, { message: 'Description must be at least 10 characters' });

    // Goal amount validation
    required(form.goalAmount, { message: 'Goal amount is required' });
    validate(form.goalAmount, ({ value }) => {
      const amount = value();
      if (amount <= 0) {
        return { kind: 'positive', message: 'Goal amount must be greater than zero' };
      }
      // Validate max 2 decimal places
      const decimalPlaces = (amount.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        return { kind: 'decimal', message: 'Goal amount must have at most 2 decimal places' };
      }
      return null;
    });

    // Start date validation
    required(form.startDate, { message: 'Start date is required' });

    // End date validation
    required(form.endDate, { message: 'End date is required' });
    validate(form.endDate, ({ value, valueOf }) => {
      const startDate = valueOf(form.startDate);
      const endDate = value();
      if (startDate && endDate && endDate <= startDate) {
        return { kind: 'dateRange', message: 'End date must be after start date' };
      }
      return null;
    });

    // Category validation
    required(form.categoryId, { message: 'Category is required' });

    // Status validation
    required(form.status, { message: 'Status is required' });

    // Detailed description validation
    required(form.detailedDescription, { message: 'Detailed description is required' });
  });

  // State management
  isLoading = signal(false);
  isLoadingProject = signal(false);
  categories = signal<ICategory[]>([]);
  isCategoriesLoading = signal(false);

  async ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.projectId.set(projectId);
      await Promise.all([
        this.loadProject(projectId),
        this.loadCategories()
      ]);
    } else {
      toast.error('Invalid project ID');
      await this.router.navigate(['/admin/projects']);
    }
  }

  /**
   * Load project data by ID and pre-populate the form
   * Handles 404 error for invalid project ID
   */
  async loadProject(id: string) {
    this.isLoadingProject.set(true);
    try {
      const project = await this.projectService.getProjectById(id);
      
      if (!project) {
        toast.error('Project not found');
        await this.router.navigate(['/admin/projects']);
        return;
      }

      // Pre-populate form with existing project data
      this.projectModel.set({
        title: project.title || '',
        description: project.description || '',
        goalAmount: project.goalAmount || 0,
        startDate: new Date(project.startDate),
        endDate: new Date(project.endDate),
        categoryId: project.category?.id || '',
        featuredImage: project.featuredImage || null,
        detailedDescription: project.detailedDescription || '',
        status: project.status || IProjectStatus.Draft,
      });
    } catch (error) {
      console.error('Error loading project:', error);
      
      // Handle 404 error
      const message = getUserFriendlyErrorMessage(error);
      const httpError = error as HttpErrorResponse;
      if (httpError?.status === 404) {
        toast.error('Project not found');
      } else {
        toast.error(message);
      }
      
      await this.router.navigate(['/admin/projects']);
    } finally {
      this.isLoadingProject.set(false);
    }
  }

  /**
   * Load all categories for the category dropdown
   */
  async loadCategories() {
    this.isCategoriesLoading.set(true);
    try {
      const categories = await this.categoryService.getAllCategories();
      this.categories.set((categories || []) as ICategory[]);
    } catch (error) {
      console.error('Error loading categories:', error);
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message);
    } finally {
      this.isCategoriesLoading.set(false);
    }
  }

  /**
   * Update the project with GraphQL mutation
   * Handles validation errors and maps them to form fields
   */
  async updateProject(projectForm: FieldTree<ProjectFormModel>) {
    const id = this.projectId();
    if (!id) {
      toast.error('Invalid project ID');
      return null;
    }

    try {
      const formValue = projectForm().value();
      
      // Validate required date fields
      if (!formValue.startDate || !formValue.endDate) {
        throw new Error('Start date and end date are required');
      }
      
      // Transform form data to match GraphQL input
      const input: IUpdateProjectInput = {
        title: formValue.title,
        description: formValue.description,
        detailedDescription: formValue.detailedDescription,
        goalAmount: formValue.goalAmount,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        categoryId: formValue.categoryId,
        featuredImage: formValue.featuredImage || undefined,
        status: formValue.status,
      };

      await this.projectService.updateProject(id, input);
      toast.success('Project updated successfully');
      await this.router.navigate(['/admin/projects']);
    } catch (e) {
      // Handle GraphQL validation errors
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {
        return mapGraphqlValidationErrors(graphqlError, projectForm);
      }

      // Handle other errors
      const errorMessage = getUserFriendlyErrorMessage(e);

      toast.error(errorMessage);

      return [
        {
          kind: 'server',
          message: errorMessage,
          fieldTree: projectForm,
        },
      ];
    }

    return null;
  }

  /**
   * Handle form submission
   */
  async onSubmit() {
    this.isLoading.set(true);
    await submit(this.projectForm, async (fieldTree) =>
      this.updateProject(fieldTree)
    );
    this.isLoading.set(false);
  }
}
