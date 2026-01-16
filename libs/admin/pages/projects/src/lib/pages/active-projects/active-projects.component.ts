import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import {
  IProject,
  IProjectPaginationInput,
  IPageInfo,
} from '@nyots/data-source';
import { ProjectService } from '@nyots/data-source/projects';
import { ProjectTableComponent } from '../../components/project-table/project-table.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { ErrorBoundaryComponent } from '../../components/error-boundary/error-boundary.component';
import { HlmButton } from '@nyots/ui/button';
import { HlmCard, HlmCardContent } from '@nyots/ui/card';
import { HlmDialogService } from '@nyots/ui/dialog';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';
import { retryAsync, getUserFriendlyErrorMessage, isNetworkError } from '../../utils/retry.util';

@Component({
  selector: 'nyots-active-projects',
  standalone: true,
  imports: [
    CommonModule,
    ProjectTableComponent,
    ErrorBoundaryComponent,
    HlmButton,
    HlmCard,
    HlmCardContent,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './active-projects.component.html',
  styleUrls: ['./active-projects.component.scss'],
})
export class ActiveProjectsComponent {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(HlmDialogService);

  // State management using signals
  projects = signal<IProject[]>([]);
  isLoading = signal(false);

  // Error state
  hasError = signal(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string | null>(null);

  // Empty set for table component
  readonly emptySet = new Set<string>();

  // Pagination state
  pagination = signal<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  });
  currentCursor = signal<string | null>(null);

  constructor() {
    // Load initial data
    this.loadActiveProjects();
  }

  /**
   * Load active projects with pagination
   */
  async loadActiveProjects() {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      // Build pagination object
      const pagination: IProjectPaginationInput = {
        limit: 20,
        cursor: this.currentCursor() ?? undefined,
      };

      const result = await retryAsync(
        () => this.projectService.getActiveProjects(pagination),
        {
          maxAttempts: 3,
          delayMs: 1000,
          onRetry: (attempt, error) => {
            console.log(`Retrying active projects load (attempt ${attempt})...`, error);
            if (isNetworkError(error)) {
              toast.info('Retrying connection...');
            }
          },
        }
      );

      if (result && result.pageInfo) {
        this.projects.set((result.projects || []).filter((p): p is IProject => p !== undefined));
        const pageInfo: IPageInfo = {
          hasNextPage: result.pageInfo.hasNextPage ?? false,
          hasPreviousPage: result.pageInfo.hasPreviousPage ?? false,
          startCursor: result.pageInfo.startCursor ?? null,
          endCursor: result.pageInfo.endCursor ?? null,
        };
        this.pagination.set(pageInfo);
      }
    } catch (error) {
      console.error('Error loading active projects:', error);
      this.hasError.set(true);
      this.errorMessage.set(getUserFriendlyErrorMessage(error));
      this.errorDetails.set(error instanceof Error ? error.message : null);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigate to next page
   */
  async nextPage() {
    const pageInfo = this.pagination();
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      this.currentCursor.set(pageInfo.endCursor);
      await this.loadActiveProjects();
    }
  }

  /**
   * Navigate to previous page
   */
  async previousPage() {
    if (this.pagination().hasPreviousPage) {
      // For previous page, we need to implement reverse pagination
      // For now, we'll reset to first page
      this.currentCursor.set(null);
      await this.loadActiveProjects();
    }
  }

  /**
   * Handle project edit action
   */
  onProjectEdit(projectId: string) {
    this.router.navigate(['/dashboard/projects', projectId, 'edit']);
  }

  /**
   * Handle project delete action with confirmation
   */
  async onProjectDelete(projectId: string) {
    const confirmed = await this.showDeleteConfirmation(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.'
    );

    if (confirmed) {
      await this.deleteProject(projectId);
    }
  }

  /**
   * Delete a single project
   */
  private async deleteProject(projectId: string) {
    try {
      await this.projectService.deleteProject(projectId);
      toast.success('Project deleted successfully');
      await this.loadActiveProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message);
    }
  }

  /**
   * Handle project view action
   */
  onProjectView(projectId: string) {
    this.router.navigate(['/dashboard/projects', projectId, 'view']);
  }

  /**
   * Navigate to create project page
   */
  navigateToCreate() {
    this.router.navigate(['/dashboard/projects/new']);
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
