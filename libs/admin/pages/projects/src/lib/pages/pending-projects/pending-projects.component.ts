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
import { ApprovalDialogComponent } from '../../components/approval-dialog/approval-dialog.component';
import { RejectionDialogComponent } from '../../components/rejection-dialog/rejection-dialog.component';
import { HlmButton } from '@nyots/ui/button';
import { HlmCard, HlmCardContent } from '@nyots/ui/card';
import { HlmDialogService } from '@nyots/ui/dialog';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideCheckCircle,
  lucideXCircle,
} from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'nyots-pending-projects',
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
      lucideChevronLeft,
      lucideChevronRight,
      lucideCheckCircle,
      lucideXCircle,
    }),
  ],
  templateUrl: './pending-projects.component.html',
  styleUrls: ['./pending-projects.component.scss'],
})
export class PendingProjectsComponent {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(HlmDialogService);

  // State management using signals
  projects = signal<IProject[]>([]);
  isLoading = signal(false);

  // Empty set for table component (no bulk actions for pending projects)
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
    this.loadPendingProjects();
  }

  /**
   * Load pending projects with pagination
   */
  async loadPendingProjects() {
    this.isLoading.set(true);
    try {
      // Build pagination object
      const pagination: IPaginationInput = {
        limit: 20,
        cursor: this.currentCursor() ?? undefined,
      };

      const result = await this.projectService.getPendingProjects(pagination);

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
      console.error('Error loading pending projects:', error);
      toast.error('Failed to load pending projects');
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
      await this.loadPendingProjects();
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
      await this.loadPendingProjects();
    }
  }

  /**
   * Handle project view action
   */
  onProjectView(projectId: string) {
    this.router.navigate(['/admin/projects', projectId, 'view']);
  }

  /**
   * Handle project approval with optional notes dialog
   */
  async onProjectApprove(projectId: string) {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }

    const dialogRef = this.dialogService.open(ApprovalDialogComponent, {
      context: {
        title: 'Approve Project',
        message: 'Are you sure you want to approve this project? It will become active.',
        projectTitle: project.title,
      },
    });

    const notes = await firstValueFrom(dialogRef.closed$);

    // If user cancelled (notes is null), do nothing
    if (notes === null) {
      return;
    }

    await this.approveProject(projectId, notes);
  }

  /**
   * Approve a project with optional notes
   */
  private async approveProject(projectId: string, notes?: string) {
    try {
      await this.projectService.approveProject(projectId, notes);
      toast.success('Project approved successfully');
      await this.loadPendingProjects();
    } catch (error) {
      console.error('Error approving project:', error);
      toast.error('Failed to approve project');
    }
  }

  /**
   * Handle project rejection with required reason dialog
   */
  async onProjectReject(projectId: string) {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }

    const dialogRef = this.dialogService.open(RejectionDialogComponent, {
      context: {
        title: 'Reject Project',
        message: 'Please provide a reason for rejecting this project.',
        projectTitle: project.title,
      },
    });

    const reason = await firstValueFrom(dialogRef.closed$);

    // If user cancelled (reason is null), do nothing
    if (reason === null) {
      return;
    }

    await this.rejectProject(projectId, reason);
  }

  /**
   * Reject a project with required reason
   */
  private async rejectProject(projectId: string, reason: string) {
    // Validate reason is not empty (should be handled by dialog, but double-check)
    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await this.projectService.rejectProject(projectId, reason);
      toast.success('Project rejected');
      await this.loadPendingProjects();
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast.error('Failed to reject project');
    }
  }
}
