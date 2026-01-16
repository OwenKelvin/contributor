import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IUserContributionSummary } from '@nyots/data-source';

/**
 * Top Contributors List Component
 * 
 * Displays a list of users with the highest contribution amounts.
 * Shows contributor name, email, total amount, and contribution count.
 * Includes links to user profiles.
 * 
 * Requirements: 11.6
 */
@Component({
  selector: 'nyots-top-contributors-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (contributors() && contributors()!.length > 0) {
      <div class="space-y-3">
        @for (contributor of contributors(); track contributor.userId) {
          <div
            class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div class="flex-1 min-w-0">
              <a
                [routerLink]="['/dashboard/users', contributor.userId]"
                class="font-medium text-sm hover:underline truncate block"
              >
                {{ contributor.userName }}
              </a>
              <p class="text-xs text-muted-foreground mt-1 truncate">
                {{ contributor.userEmail }}
              </p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ contributor.contributionCount }} contribution{{
                  contributor.contributionCount !== 1 ? 's' : ''
                }}
              </p>
            </div>
            <div class="text-right ml-4">
              <div class="font-semibold text-sm">
                {{ contributor.totalAmount | currency }}
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="flex items-center justify-center py-8 text-muted-foreground">
        <p class="text-sm">No contributors yet</p>
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
export class TopContributorsListComponent {
  // Input
  contributors = input.required<IUserContributionSummary[]>();
}
