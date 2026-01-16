import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProjectContributionSummary } from '@nyots/data-source';

/**
 * Top Projects List Component
 * 
 * Displays a list of projects with the highest contribution amounts.
 * Shows project name, total amount, and contribution count.
 * Includes links to project details.
 * 
 * Requirements: 11.7
 */
@Component({
  selector: 'nyots-top-projects-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (projects() && projects()!.length > 0) {
      <div class="space-y-3">
        @for (project of projects(); track project.projectId) {
          <div
            class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div class="flex-1 min-w-0">
              <a
                [routerLink]="['/dashboard/projects', project.projectId]"
                class="font-medium text-sm hover:underline truncate block"
              >
                {{ project.projectTitle }}
              </a>
              <p class="text-xs text-muted-foreground mt-1">
                {{ project.contributionCount }} contribution{{
                  project.contributionCount !== 1 ? 's' : ''
                }}
              </p>
            </div>
            <div class="text-right ml-4">
              <div class="font-semibold text-sm">
                {{ project.totalAmount | currency }}
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="flex items-center justify-center py-8 text-muted-foreground">
        <p class="text-sm">No projects with contributions yet</p>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TopProjectsListComponent {
  // Input
  projects = input.required<IProjectContributionSummary[]>();
}
