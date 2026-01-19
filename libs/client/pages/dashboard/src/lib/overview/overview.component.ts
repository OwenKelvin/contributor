import { Component, inject, OnInit, signal } from '@angular/core';
import { ContributionService } from '@nyots/data-source/contributions';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@nyots/ui/button';

@Component({
  selector: 'nyots-overview',
  imports: [
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    HlmButton,
  ],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p class="text-muted-foreground mt-2">Here's an overview of your recent activity</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <hlm-spinner />
        </div>
      } @else {
        <div class="grid gap-6">
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Recent Contributions</h3>
            </div>
            <div hlmCardContent>
              @if (recentContributions().length === 0) {
                <p class="text-muted-foreground text-center py-8">
                  You haven't made any contributions yet.
                  <a routerLink="/dashboard/projects" class="text-primary hover:underline ml-1">
                    Browse projects to get started
                  </a>
                </p>
              } @else {
                <div class="space-y-4">
                  @for (contribution of recentContributions(); track contribution.id) {
                    <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div class="flex-1">
                        <p class="font-medium">{{ contribution.project?.title }}</p>
                        <p class="text-sm text-muted-foreground">
                          {{ contribution.createdAt | date: 'medium' }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold">{{ contribution.amount | currency }}</p>
                        <p class="text-sm" [class]="getStatusClass(contribution.paymentStatus)">
                          {{ contribution.paymentStatus }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
                <div class="mt-6 text-center">
                  <a routerLink="/dashboard/my-contributions" hlmBtn variant="outline">
                    View All Contributions
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OverviewComponent implements OnInit {
  private contributionService = inject(ContributionService);
  
  loading = signal(true);
  recentContributions = signal<Array<{ 
    id: string; 
    amount: number; 
    paymentStatus: string; 
    createdAt: string; 
    project?: { title: string } | null 
  }>>([]);

  async ngOnInit() {
    try {
      const result = await this.contributionService.getMyContributions({
        pagination: { first: 3 }
      });
      const contributions = result?.edges?.map(edge => edge.node) || [];
      this.recentContributions.set(contributions);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'COMPLETED': 'text-green-600',
      'PENDING': 'text-yellow-600',
      'FAILED': 'text-red-600',
      'REFUNDED': 'text-gray-600',
    };
    return statusMap[status] || 'text-gray-600';
  }
}
