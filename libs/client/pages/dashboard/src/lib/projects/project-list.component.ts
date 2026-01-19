import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectService } from '@nyots/data-source/projects';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle, HlmCardDescription, HlmCardFooter } from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmButton } from '@nyots/ui/button';
import { HlmBadge } from '@nyots/ui/badge';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nyots-project-list',
  imports: [
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardFooter,
    HlmSpinner,
    HlmButton,
    HlmBadge,
    CurrencyPipe,
    RouterLink,
  ],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-3xl font-bold">Active Projects</h1>
        <p class="text-muted-foreground mt-2">Browse and contribute to active projects</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <hlm-spinner />
        </div>
      } @else {
        @if (projects().length === 0) {
          <div hlmCard class="text-center py-12">
            <div hlmCardContent>
              <p class="text-muted-foreground">No active projects available at the moment.</p>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (project of projects(); track project.id) {
              <div hlmCard class="flex flex-col">
                <div hlmCardHeader>
                  <h3 hlmCardTitle>{{ project.name }}</h3>
                  <p hlmCardDescription class="line-clamp-2">{{ project.description }}</p>
                </div>
                <div hlmCardContent class="flex-1">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted-foreground">Goal:</span>
                      <span class="font-medium">{{ project.goalAmount | currency }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted-foreground">Raised:</span>
                      <span class="font-medium">{{ project.currentAmount | currency }}</span>
                    </div>
                    <div class="w-full bg-secondary rounded-full h-2 mt-2">
                      <div 
                        class="bg-primary h-2 rounded-full transition-all"
                        [style.width.%]="getProgress(project.currentAmount, project.goalAmount)"
                      ></div>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      @if (project.category) {
                        <span hlmBadge variant="secondary">{{ project.category.name }}</span>
                      }
                      <span hlmBadge variant="outline">{{ project.status }}</span>
                    </div>
                  </div>
                </div>
                <div hlmCardFooter class="flex gap-2">
                  <a 
                    [routerLink]="['/dashboard/projects', project.id]"
                    hlmBtn 
                    class="flex-1"
                  >
                    View Details
                  </a>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  
  loading = signal(true);
  projects = signal<Array<{
    id: string;
    name: string;
    description: string;
    goalAmount: number;
    currentAmount: number;
    status: string;
    category?: { name: string } | null;
  }>>([]);

  async ngOnInit() {
    try {
      const result = await this.projectService.getActiveProjects();
      const projects = result?.edges?.map(edge => ({
        id: edge.node.id,
        name: edge.node.title,
        description: edge.node.description,
        goalAmount: edge.node.goalAmount,
        currentAmount: edge.node.currentAmount,
        status: edge.node.status,
        category: edge.node.category
      })) || [];
      this.projects.set(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getProgress(current: number, goal: number): number {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  }
}
