import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import {
  IProject,
  IProjectFilter,
  IProjectStatus,
  ICategory,
  IProjectPaginationInput,
  IPageInfo,
} from '@nyots/data-source';
import { ProjectService } from '@nyots/data-source/projects';
import { CategoryService } from '@nyots/data-source/projects';
import { ProjectTableComponent } from '../../components/project-table/project-table.component';
import {
  BulkActionsToolbarComponent,
  BulkAction,
} from '../../components/bulk-actions-toolbar/bulk-actions-toolbar.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { StatusSelectionDialogComponent } from '../../components/status-selection-dialog/status-selection-dialog.component';
import { ErrorBoundaryComponent } from '../../components/error-boundary/error-boundary.component';
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
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideFilter,
  lucidePlus,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';
import { retryAsync, getUserFriendlyErrorMessage, isNetworkError } from '../../utils/retry.util';

@Component({
  selector: 'nyots-all-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProjectTableComponent,
    BulkActionsToolbarComponent,
    ErrorBoundaryComponent,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmIcon,
    NgIcon,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideFilter,
      lucidePlus,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.scss'],
})
export class AllProjectsComponent {
  private readonly projectService = inject(ProjectService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(HlmDialogService);

  // State management using signals
  projects = signal<IProject[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  debouncedSearchTerm = signal('');
  selectedProjects = signal<Set<string>>(new Set());
  categories = signal<ICategory[]>([]);

  // Error state
  hasError = signal(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string | null>(null);

  // Filter state
  filters = signal<IProjectFilter>({});
  selectedStatus = signal<IProjectStatus | ''>('');
  selectedCategoryId = signal<string>('');
  dateRangeStart = signal<Date | null>(null);
  dateRangeEnd = signal<Date | null>(null);

  // Pagination state
  pagination = signal<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  });
  currentCursor = signal<string | null>(null);

  // Computed properties
  selectedCount = computed(() => this.selectedProjects().size);
  hasSelection = computed(() => this.selectedCount() > 0);

  // Bulk actions configuration
  availableBulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: 'lucideTrash2',
      variant: 'destructive',
    },
    {
      id: 'changeStatus',
      label: 'Change Status',
      icon: 'lucideEdit3',
      variant: 'outline',
    },
  ];

  // Debounce timer for search
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Load initial data
    this.loadCategories();
    this.loadProjects();

    // Set up search debouncing
    effect(() => {
      const term = this.searchTerm();
      if (this.searchDebounceTimer !== null) {
        clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.debouncedSearchTerm.set(term);
        this.loadProjects();
      }, 300);
    });

    // React to filter changes
    effect(() => {
      // Watch for filter changes
      this.filters();
      // Reset to first page when filters change
      this.currentCursor.set(null);
    });
  }

  /**
   * Load all categories for filter dropdown
   */
  async loadCategories() {
    try {
      const categories = await retryAsync(
        () => this.categoryService.getAllCategories(),
        {
          maxAttempts: 3,
          delayMs: 1000,
          onRetry: (attempt) => {
            console.log(`Retrying category load (attempt ${attempt})...`);
          },
        },
      );
      this.categories.set(
        (categories || []).filter((c): c is ICategory => c !== undefined),
      );
    } catch (error) {
      console.error('Error loading categories:', error);
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message);
    }
  }

  /**
   * Load projects with current search, filters, and pagination
   */
  async loadProjects() {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      // Build filter object
      const filter: IProjectFilter = {};

      if (this.selectedStatus()) {
        filter.status = this.selectedStatus() as IProjectStatus;
      }

      if (this.selectedCategoryId()) {
        filter.categoryId = this.selectedCategoryId();
      }

      if (this.dateRangeStart() && this.dateRangeEnd()) {
        const start = this.dateRangeStart();
        const end = this.dateRangeEnd();
        if (start && end) {
          filter.dateRange = {
            start,
            end,
          };
        }
      }

      // Build pagination object
      const pagination: IProjectPaginationInput = {
        first: 20,
        after: this.currentCursor() ?? undefined,
      };

      const result = await retryAsync(
        () =>
          this.projectService.getAllProjects({
            search: this.debouncedSearchTerm() || undefined,
            filters: Object.keys(filter).length > 0 ? filter : undefined,
            pagination,
          }),
        {
          maxAttempts: 3,
          delayMs: 1000,
          onRetry: (attempt, error) => {
            console.log(`Retrying project load (attempt ${attempt})...`, error);
            if (isNetworkError(error)) {
              toast.info('Retrying connection...');
            }
          },
        },
      );

      if (result && result.pageInfo) {
        this.projects.set(
          result.edges
            .map((edge) => edge.node)
            .filter((p): p is IProject => !!p),
        );
        const pageInfo: IPageInfo = {
          hasNextPage: result.pageInfo.hasNextPage ?? false,
          hasPreviousPage: result.pageInfo.hasPreviousPage ?? false,
          startCursor: result.pageInfo.startCursor ?? null,
          endCursor: result.pageInfo.endCursor ?? null,
        };
        this.pagination.set(pageInfo);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this.hasError.set(true);
      this.errorMessage.set(getUserFriendlyErrorMessage(error));
      this.errorDetails.set(error instanceof Error ? error.message : null);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle search input change
   */
  onSearchChange(value: string) {
    this.searchTerm.set(value);
    // Reset to first page when search changes
    this.currentCursor.set(null);
  }

  /**
   * Apply filters and reload projects
   */
  applyFilters() {
    // Update filters signal to trigger effect
    const filter: IProjectFilter = {};

    if (this.selectedStatus()) {
      filter.status = this.selectedStatus() as IProjectStatus;
    }

    if (this.selectedCategoryId()) {
      filter.categoryId = this.selectedCategoryId();
    }

    if (this.dateRangeStart() && this.dateRangeEnd()) {
      const start = this.dateRangeStart();
      const end = this.dateRangeEnd();
      if (start && end) {
        filter.dateRange = {
          start,
          end,
        };
      }
    }

    this.filters.set(filter);
    this.currentCursor.set(null);
    this.loadProjects();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.selectedStatus.set('');
    this.selectedCategoryId.set('');
    this.dateRangeStart.set(null);
    this.dateRangeEnd.set(null);
    this.filters.set({});
    this.currentCursor.set(null);
    this.loadProjects();
  }

  /**
   * Navigate to next page
   */
  async nextPage() {
    const pageInfo = this.pagination();
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      this.currentCursor.set(pageInfo.endCursor);
      await this.loadProjects();
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
      await this.loadProjects();
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
      'Are you sure you want to delete this project? This action cannot be undone.',
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
      await this.loadProjects();
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
    console.log(['/dashboard','projects', projectId, 'view']);
    this.router.navigate(['/dashboard','projects', projectId, 'view']);
  }

  /**
   * Handle selection change from table
   */
  onSelectionChange(selection: Set<string>) {
    this.selectedProjects.set(selection);
  }

  /**
   * Handle bulk action selection
   */
  async onBulkActionSelected(actionId: string) {
    const selectedIds = Array.from(this.selectedProjects());

    if (selectedIds.length === 0) {
      toast.error('No projects selected');
      return;
    }

    switch (actionId) {
      case 'delete':
        await this.handleBulkDelete(selectedIds);
        break;
      case 'changeStatus':
        await this.handleBulkStatusChange(selectedIds);
        break;
      default:
        console.warn('Unknown bulk action:', actionId);
    }
  }

  /**
   * Handle bulk delete with confirmation
   */
  private async handleBulkDelete(projectIds: string[]) {
    const confirmed = await this.showDeleteConfirmation(
      'Delete Projects',
      `Are you sure you want to delete ${projectIds.length} project(s)? This action cannot be undone.`,
    );

    if (confirmed) {
      try {
        // Use bulk delete by deleting projects individually
        // Note: In a real implementation, you might want to add a bulkDelete mutation
        const deletePromises = projectIds.map((id) =>
          this.projectService.deleteProject(id),
        );
        const results = await Promise.allSettled(deletePromises);

        const successCount = results.filter(
          (r) => r.status === 'fulfilled',
        ).length;
        const failureCount = results.filter(
          (r) => r.status === 'rejected',
        ).length;

        if (successCount > 0) {
          toast.success(`Successfully deleted ${successCount} project(s)`);
        }

        if (failureCount > 0) {
          const errors = results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map((r) => getUserFriendlyErrorMessage(r.reason))
            .join(', ');
          toast.error(`Failed to delete ${failureCount} project(s): ${errors}`);
        }

        this.selectedProjects.set(new Set());
        await this.loadProjects();
      } catch (error) {
        console.error('Error deleting projects:', error);
        const errorMessage = getUserFriendlyErrorMessage(error);
        toast.error(`Failed to delete projects: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle bulk status change
   */
  private async handleBulkStatusChange(projectIds: string[]) {
    const newStatus = await this.showStatusSelectionDialog(
      'Change Project Status',
      `Select a new status for ${projectIds.length} project(s)`,
    );

    if (newStatus) {
      try {
        const result = await this.projectService.bulkUpdateProjects(
          projectIds,
          {
            status: newStatus,
          },
        );

        if (result) {
          if (result.successCount > 0) {
            toast.success(
              `Successfully updated ${result.successCount} project(s) to ${newStatus}`,
            );
          }

          if (result.failureCount > 0) {
            const errorMessages =
              result.errors
                ?.map((e) => getUserFriendlyErrorMessage(e))
                .join(', ') || 'Unknown errors';
            toast.error(
              `Failed to update ${result.failureCount} project(s): ${errorMessages}`,
            );
          }
        }

        this.selectedProjects.set(new Set());
        await this.loadProjects();
      } catch (error) {
        console.error('Error updating projects:', error);
        const errorMessage = getUserFriendlyErrorMessage(error);
        toast.error(`Failed to update projects: ${errorMessage}`);
      }
    }
  }

  /**
   * Clear selection
   */
  onClearSelection() {
    this.selectedProjects.set(new Set());
  }

  /**
   * Handle date range start change
   */
  onDateRangeStartChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dateRangeStart.set(input.value ? new Date(input.value) : null);
  }

  /**
   * Handle date range end change
   */
  onDateRangeEndChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dateRangeEnd.set(input.value ? new Date(input.value) : null);
  }

  /**
   * Show delete confirmation dialog
   */
  private async showDeleteConfirmation(
    title: string,
    message: string,
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

  /**
   * Show status selection dialog
   */
  private async showStatusSelectionDialog(
    title: string,
    message: string,
  ): Promise<IProjectStatus | null> {
    const dialogRef = this.dialogService.open(StatusSelectionDialogComponent, {
      context: {
        title,
        message,
      },
    });

    const result = await firstValueFrom(dialogRef.closed$);
    return result as IProjectStatus | null;
  }

  // Expose status enum for template
  readonly ProjectStatus = IProjectStatus;
}
