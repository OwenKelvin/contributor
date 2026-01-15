import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import {
  IProject,
  IPaginationInput,
  IPageInfo,
} from '@nyots/data-source';
import { ProjectService } from '@nyots/data-source/projects';
import { ProjectTableComponent } from '../../components/project-table/project-table.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
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

@Component({
  selector: 'nyots-active-projects',
  standalone: true,
  imports: [
    CommonModule,
    ProjectTableComponent,
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

  // Empty set for table component
  readonly emptySet = new Set<string>();

  // Pagination state
  pagination = signal<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    cursor: null,
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
    try {
      // Build pagination object
      const pagination: IPaginationInput = {
        limit: 20,
        cursor: this.currentCursor() ?? undefined,
      };

      const result = await this.projectService.getActiveProjects(pagination);

      if (result && result.pageInfo) {
        this.projects.set((result.projects || []).filter((p): p is IProject => p !== undefined));
        const pageInfo: IPageInfo = {
          hasNextPage: result.pageInfo.hasNextPage ?? false,
          hasPreviousPage: result.pageInfo.hasPreviousPage ?? false,
          cursor: result.pageInfo.cursor ?? null,
        };
        this.pagination.set(pageInfo);
      }
    } catch (error) {
      console.error('Error loading active projects:', error);
      toast.error('Failed to load active projects');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigate to next page
   */
  async nextPage() {
    const pageInfo = this.pagination();
    if (pageInfo.hasNextPage && pageInfo.cursor) {
      this.currentCursor.set(pageInfo.cursor);
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
    this.router.navigate(['/admin/projects', projectId, 'edit']);
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
      toast.error('Failed to delete project');
    }
  }

  /**
   * Handle project view action
   */
  onProjectView(projectId: string) {
    this.router.navigate(['/admin/projects', projectId, 'view']);
  }

  /**
   * Navigate to create project page
   */
  navigateToCreate() {
    this.router.navigate(['/admin/projects/new']);
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
