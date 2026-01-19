import { Component, inject, OnInit, signal, input } from '@angular/core';
import { ProjectService } from '@nyots/data-source/projects';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmButton } from '@nyots/ui/button';
import { HlmBadge } from '@nyots/ui/badge';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HlmDialogService } from '@nyots/ui/dialog';
import { ContributionDialogComponent } from '@nyots/client-pages/contributions';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'nyots-project-detail',
  imports: [
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
    HlmButton,
    HlmBadge,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
  ],
  template: `
    <div class="p-6 space-y-6">
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <hlm-spinner />
        </div>
      } @else if (project()) {
        <div class="space-y-6">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-3xl font-bold">{{ project()?.title }}</h1>
                <span hlmBadge [variant]="getStatusVariant(project()?.status || '')">
                  {{ project()?.status }}
                </span>
              </div>
              @if (project()?.category) {
                <span hlmBadge variant="secondary">{{ project()?.category?.name }}</span>
              }
            </div>
            <button hlmBtn size="lg" (click)="openContributionDialog()">
              Contribute Now
            </button>
          </div>

          <!-- Funding Progress Card -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Funding Progress</h3>
            </div>
            <div hlmCardContent>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Current Amount</p>
                    <p class="text-2xl font-bold">{{ project()?.currentAmount | currency }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-muted-foreground">Goal Amount</p>
                    <p class="text-2xl font-bold">{{ project()?.goalAmount | currency }}</p>
                  </div>
                </div>
                <div class="w-full bg-secondary rounded-full h-3">
                  <div
                    class="bg-primary h-3 rounded-full transition-all"
                    [style.width.%]="getProgress()"
                  ></div>
                </div>
                <p class="text-sm text-muted-foreground text-center">
                  {{ getProgress() | number: '1.0-1' }}% funded
                </p>
              </div>
            </div>
          </div>

          <!-- Project Details Card -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>About This Project</h3>
            </div>
            <div hlmCardContent>
              <div class="prose max-w-none">
                <p class="text-muted-foreground whitespace-pre-wrap"
                   [innerHTML]="project()?.detailedDescription || project()?.description"></p>
              </div>
            </div>
          </div>

          <!-- Project Timeline Card -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Timeline</h3>
            </div>
            <div hlmCardContent>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground">Start Date</p>
                  <p class="font-medium">{{ project()?.startDate | date: 'longDate' }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">End Date</p>
                  <p class="font-medium">{{ project()?.endDate | date: 'longDate' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button hlmBtn size="lg" class="flex-1" (click)="openContributionDialog()">
              Contribute Now
            </button>
            <button hlmBtn variant="outline" size="lg" routerLink="/dashboard/projects">
              Back to Projects
            </button>
          </div>
        </div>
      } @else {
        <div hlmCard class="text-center py-12">
          <div hlmCardContent>
            <p class="text-muted-foreground mb-4">Project not found.</p>
            <button hlmBtn routerLink="/dashboard/projects">
              Back to Projects
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProjectDetailComponent implements OnInit {
  private projectService = inject(ProjectService);
  private dialogService = inject(HlmDialogService);
  private router = inject(Router);

  id = input.required<string>();

  loading = signal(true);
  project = signal<{
    id: string;
    title: string;
    description: string;
    detailedDescription: string;
    goalAmount: number;
    currentAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    category?: { name: string } | null;
  } | null>(null);

  async ngOnInit() {
    await this.loadProject();
  }

  async loadProject() {
    this.loading.set(true);
    try {
      const result = await this.projectService.getProjectById(this.id());
      if (result) {
        this.project.set({
          id: result.id,
          title: result.title,
          description: result.description,
          detailedDescription: result.detailedDescription,
          goalAmount: result.goalAmount,
          currentAmount: result.currentAmount,
          startDate: result.startDate,
          endDate: result.endDate,
          status: result.status,
          category: result.category
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getProgress(): number {
    const proj = this.project();
    if (!proj || !proj.goalAmount || proj.goalAmount === 0) return 0;
    return Math.min((proj.currentAmount / proj.goalAmount) * 100, 100);
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'ACTIVE': 'default',
      'PENDING': 'secondary',
      'COMPLETED': 'outline',
      'ARCHIVED': 'destructive',
    };
    return variantMap[status] || 'outline';
  }

  async openContributionDialog() {
    const proj = this.project();
    if (!proj) return;

    const dialogRef = this.dialogService.open(ContributionDialogComponent, {
      context: {
        projectId: proj.id,
        projectTitle: proj.title,
      },
    });

    const result = await firstValueFrom(dialogRef.closed$);

    // If contribution was successful, refresh the project data
    if (result === true) {
      await this.loadProject();
    }
  }
}
