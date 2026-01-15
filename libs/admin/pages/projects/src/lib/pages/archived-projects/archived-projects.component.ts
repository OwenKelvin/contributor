import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import {
  IProject,
  IArchivedProjectFilter,
  IPaginationInput,
  IPageInfo,
  IProjectStatus,
} from '@nyots/data-source';
import { ProjectService } from '@nyots/data-source/projects';
import { ProjectTableComponent } from '../../components/project-table/project-table.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmCard, HlmCardContent } from '@nyots/ui/card';
import { HlmDialogService } from '@nyots/ui/dialog';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideRotateCcw,
  lucideTrash2,
  lucideFilter,
  lucideX,
} from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'nyots-archived-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProjectTableComponent,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardContent,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideRotateCcw,
      lucideTrash2,
      lucideFilter,
      lucideX,
    }),
  ],
  templateUrl: './archived-projects.component.html',
  styleUrls: ['./archived-projects.component.scss'],
})
export class ArchivedProjectsComponent {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(HlmDialogService);

  // State management using signals
  projects = signal<IProject[]>([]);
  isLoading = signal(false);

  // Empty set for table component (no bulk actions for archived projects)
  readonly emptySet = new Set<string>();

  // Date range filter state
  archivedAfter = signal<string>('');
  archivedBefore = signal<string>('');
  showFilters = signal(false);

  // Pagination state
  pagination = signal<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    cursor: null,
  });
  currentCursor = signal<string | null>(null);

  constructor() {
    // Load initial data
    this.loadArchivedProjects();
  }

  /**
   * Load archived projects with optional date filters and pagination
   */
  async loadArchivedProjects() {
    this.isLoading.set(true);
    try {
      // Build filter object
      const filter: IArchivedProjectFilter = {};
      
      if (this.archivedAfter()) {
        filter.archivedAfter = new Date(this.archivedAfter());
      }
      
      if (this.archivedBefore()) {
        filter.archivedBefore = new Date(this.archivedBefore());
      }

      // Build pagination object
      const pagination: IPaginationInput = {
        limit: 20,
        cursor: this.currentCursor() ?? undefined,
      };

      const result = await this.projectService.getArchivedProjects({
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        pagination,
      });

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
      console.error('Error loading archived projects:', error);
      toast.error('Failed to load archived projects');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Toggle filter visibility
   */
  toggleFilters() {
    this.showFilters.set(!this.showFilters());
  }

  /**
   * Apply date range filters
   */
  applyFilters() {
    // Validate date range
    if (this.archivedAfter() && this.archivedBefore()) {
      const after = new Date(this.archivedAfter());
      const before = new Date(this.archivedBefore());
      
      if (after > before) {
        toast.error('Start date must be before end date');
        return;
      }
    }

    // Reset to first page when filters change
    this.currentCursor.set(null);
    this.loadArchivedProjects();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.archivedAfter.set('');
    this.archivedBefore.set('');
    this.currentCursor.set(null);
    this.loadArchivedProjects();
  }

  /**
   * Navigate to next page
   */
  async nextPage() {
    const pageInfo = this.pagination();
    if (pageInfo.hasNextPage && pageInfo.cursor) {
      this.currentCursor.set(pageInfo.cursor);
      await this.loadArchivedProjects();
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
      await this.loadArchivedProjects();
    }
  }

  /**
   * Handle project view action
   */
  onProjectView(projectId: string) {
    this.router.navigate(['/admin/projects', projectId, 'view']);
  }

  /**
   * Handle project restore action
   * Restores an archived project by changing its status to draft
   */
  async onProjectRestore(projectId: string) {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }

    const confirmed = await this.showRestoreConfirmation(
      'Restore Project',
      `Are you sure you want to restore "${project.title}"? It will be moved to draft status.`
    );

    if (confirmed) {
      await this.restoreProject(projectId);
    }
  }

  /**
   * Restore a project by updating its status to draft
   */
  private async restoreProject(projectId: string) {
    try {
      await this.projectService.updateProject(projectId, {
        status: IProjectStatus.Draft,
      });
      toast.success('Project restored successfully');
      await this.loadArchivedProjects();
    } catch (error) {
      console.error('Error restoring project:', error);
      toast.error('Failed to restore project');
    }
  }

  /**
   * Handle permanent delete action with strong warning
   */
  async onProjectPermanentDelete(projectId: string) {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }

    const confirmed = await this.showPermanentDeleteConfirmation(
      'Permanently Delete Project',
      `⚠️ WARNING: This action cannot be undone!\n\nAre you sure you want to permanently delete "${project.title}"?\n\nAll project data, including contributions and history, will be permanently removed from the system.`
    );

    if (confirmed) {
      await this.permanentlyDeleteProject(projectId);
    }
  }

  /**
   * Permanently delete a project
   */
  private async permanentlyDeleteProject(projectId: string) {
    try {
      await this.projectService.deleteProject(projectId);
      toast.success('Project permanently deleted');
      await this.loadArchivedProjects();
    } catch (error) {
      console.error('Error permanently deleting project:', error);
      toast.error('Failed to permanently delete project');
    }
  }

  /**
   * Show restore confirmation dialog
   */
  private async showRestoreConfirmation(
    title: string,
    message: string
  ): Promise<boolean> {
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title,
        message,
        confirmLabel: 'Restore',
        cancelLabel: 'Cancel',
        variant: 'default',
      },
    });

    const result = await firstValueFrom(dialogRef.closed$);
    return result === true;
  }

  /**
   * Show permanent delete confirmation dialog with warning
   */
  private async showPermanentDeleteConfirmation(
    title: string,
    message: string
  ): Promise<boolean> {
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title,
        message,
        confirmLabel: 'Permanently Delete',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      },
    });

    const result = await firstValueFrom(dialogRef.closed$);
    return result === true;
  }
}
