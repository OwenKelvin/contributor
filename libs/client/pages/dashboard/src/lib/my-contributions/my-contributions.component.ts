import { Component, inject, OnInit, signal } from '@angular/core';
import { ContributionService } from '@nyots/data-source/contributions';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmButton } from '@nyots/ui/button';
import { HlmBadge } from '@nyots/ui/badge';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nyots-my-contributions',
  imports: [
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
    HlmButton,
    HlmBadge,
    DatePipe,
    CurrencyPipe,
    RouterLink,
  ],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">My Contributions</h1>
          <p class="text-muted-foreground mt-2">View and manage all your contributions</p>
        </div>
        <a routerLink="/dashboard/contributions/create" hlmBtn>
          Make New Contribution
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <hlm-spinner />
        </div>
      } @else {
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Contribution History</h3>
          </div>
          <div hlmCardContent>
            @if (contributions().length === 0) {
              <div class="text-center py-12">
                <p class="text-muted-foreground mb-4">You haven't made any contributions yet.</p>
                <a routerLink="/dashboard/projects" hlmBtn>
                  Browse Projects
                </a>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table hlm class="w-full">
                  <thead>
                    <tr>
                      <th class="text-left p-4 font-medium">Project</th>
                      <th class="text-left p-4 font-medium">Amount</th>
                      <th class="text-left p-4 font-medium">Date</th>
                      <th class="text-left p-4 font-medium">Status</th>
                      <th class="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (contribution of contributions(); track contribution.id) {
                      <tr class="border-t">
                        <td class="p-4 font-medium">
                          {{ contribution.project?.title || 'Unknown Project' }}
                        </td>
                        <td class="p-4">
                          {{ contribution.amount | currency }}
                        </td>
                        <td class="p-4">
                          {{ contribution.createdAt | date: 'short' }}
                        </td>
                        <td class="p-4">
                          <span hlmBadge [variant]="getStatusVariant(contribution.paymentStatus)">
                            {{ contribution.paymentStatus }}
                          </span>
                        </td>
                        <td class="p-4 text-right">
                          <a 
                            [routerLink]="['/dashboard/contributions', contribution.id]"
                            hlmBtn 
                            variant="ghost" 
                            size="sm"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (pageInfo()) {
                <div class="flex items-center justify-between mt-6 pt-6 border-t">
                  <div class="text-sm text-muted-foreground">
                    Showing {{ contributions().length }} contributions
                  </div>
                  <div class="flex gap-2">
                    <button 
                      hlmBtn 
                      variant="outline" 
                      size="sm"
                      [disabled]="!pageInfo()?.hasPreviousPage"
                      (click)="previousPage()"
                    >
                      Previous
                    </button>
                    <button 
                      hlmBtn 
                      variant="outline" 
                      size="sm"
                      [disabled]="!pageInfo()?.hasNextPage"
                      (click)="nextPage()"
                    >
                      Next
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MyContributionsComponent implements OnInit {
  private contributionService = inject(ContributionService);
  
  loading = signal(true);
  contributions = signal<Array<{
    id: string;
    amount: number;
    paymentStatus: string;
    createdAt: string;
    project?: { title: string } | null;
  }>>([]);
  pageInfo = signal<{
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  } | null>(null);
  currentCursor = signal<string | null>(null);
  pageSize = 10;

  async ngOnInit() {
    await this.loadContributions();
  }

  async loadContributions() {
    this.loading.set(true);
    try {
      const result = await this.contributionService.getMyContributions({
        pagination: { 
          first: this.pageSize,
          after: this.currentCursor()
        }
      });
      const contributions = result?.edges?.map(edge => edge.node) || [];
      this.contributions.set(contributions);
      this.pageInfo.set(result?.pageInfo || null);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async nextPage() {
    const pageInfo = this.pageInfo();
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      this.currentCursor.set(pageInfo.endCursor);
      await this.loadContributions();
    }
  }

  async previousPage() {
    // For simplicity, we'll reload from the beginning
    // A full implementation would track cursor history
    this.currentCursor.set(null);
    await this.loadContributions();
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'COMPLETED': 'default',
      'PENDING': 'secondary',
      'FAILED': 'destructive',
      'REFUNDED': 'outline',
    };
    return variantMap[status] || 'outline';
  }
}
