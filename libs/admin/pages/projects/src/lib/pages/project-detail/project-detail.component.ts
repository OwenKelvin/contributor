import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGetProjectByIdQuery, ProjectService } from '@nyots/data-source/projects';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEdit, lucideArchive, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonGroup } from '@nyots/ui/button-group';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmLabel } from '@nyots/ui/label';
import { HlmBadge } from '@nyots/ui/badge';
import { HlmSpinner } from '@nyots/ui/spinner';
import { ErrorBoundary} from '@nyots/ui/alert';
import { CurrencyPipe, DatePipe } from '@angular/common';
@Component({
  selector: 'nyots-project-detail',
  standalone: true,
  imports: [
    NgIcon,
    HlmButtonGroup,
    HlmButton,
    HlmIcon,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
    HlmLabel,
    HlmBadge,
    HlmSpinner,
    ErrorBoundary,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
  providers: [provideIcons({ lucideEdit, lucideArchive, lucideTrash2 })],
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  projectId = signal<string | null>(null);
  project = signal<IGetProjectByIdQuery['getProjectById'] | undefined>(
    undefined,
  );
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  errorDetails = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.projectId.set(id);
        this.loadProjectDetails(id);
      } else {
        this.hasError.set(true);
        this.errorMessage.set('Project ID not found in route parameters.');
        this.isLoading.set(false);
      }
    });
  }

  async loadProjectDetails(id: string): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);
    this.errorDetails.set(null);

    try {
      const project = await this.projectService.getProjectById(id);
      if (project) {
        this.project.set(project);
      } else {
        this.hasError.set(true);
        this.errorMessage.set('Project not found.');
      }
    } catch (error: any) {
      this.hasError.set(true);
      this.errorMessage.set('Failed to load project details.');
      this.errorDetails.set(error.message || 'Unknown error');
    } finally {
      this.isLoading.set(false);
    }
  }

  onEditProject(): void {
    if (this.projectId()) {
      this.router.navigate([
        '/dashboard',
        'projects',
        this.projectId(),
        'edit',
      ]);
    }
  }

  onArchiveProject(): void {
    // Implement archive logic here
    console.log('Archive Project:', this.projectId());
  }

  onDeleteProject(): void {
    // Implement delete logic here
    console.log('Delete Project:', this.projectId());
  }
}
