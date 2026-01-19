import { Component, inject, OnInit, signal } from '@angular/core';
import { ContributionService } from '@nyots/data-source/contributions';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmButton } from '@nyots/ui/button';
import { HlmBadge } from '@nyots/ui/badge';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

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
          <h1 class="text-3xl font-bold">{{ getTitle() }}</h1>
          <p class="text-muted-foreground mt-2">{{ getDescription() }}</p>
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
              @if (viewType() === 'by-project') {
                <!-- Grouped by Project View -->
                <div class="space-y-6">
                  @for (group of groupedContributions(); track group.projectId) {
                    <div class="border rounded-lg p-4">
                      <h4 class="font-semibold text-lg mb-4">{{ group.projectName }}</h4>
                      <div class="space-y-2">
                        @for (contribution of group.contributions; track contribution.id) {
                          <div class="flex items-center justify-between border-b pb-2 last:border-0">
                            <div class="flex-1">
                              <p class="text-sm text-muted-foreground">
                                {{ contribution.createdAt | date: 'short' }}
                              </p>
                            </div>
                            <div class="flex items-center gap-4">
                              <p class="font-medium">{{ contribution.amount | currency }}</p>
                              <span hlmBadge [variant]="getStatusVariant(contribution.paymentStatus)" size="sm">
                                {{ contribution.paymentStatus }}
                              </span>
                              <a 
                                [routerLink]="['/dashboard/contributions', contribution.id]"
                                hlmBtn 
                                variant="ghost" 
                                size="sm"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        }
                      </div>
                      <div class="mt-3 pt-3 border-t flex justify-between items-center">
                        <span class="text-sm font-medium">Total for this project:</span>
                        <span class="font-bold">{{ group.total | currency }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <!-- All Contributions View (Table) -->
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
              }

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
  private route = inject(ActivatedRoute);
  
  loading = signal(true);
  viewType = signal<'all' | 'by-project'>('all');
  contributions = signal<Array<{
    id: string;
    amount: number;
    paymentStatus: string;
    createdAt: string;
    project?: { id: string; title: string } | null;
  }>>([]);
  groupedContributions = signal<Array<{
    projectId: string;
    projectName: string;
    contributions: Array<{
      id: string;
      amount: number;
      paymentStatus: string;
      createdAt: string;
    }>;
    total: number;
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
    // Subscribe to query params to handle view type changes
    this.route.queryParams.subscribe(params => {
      const view = params['view'] || 'all';
      this.viewType.set(view === 'by-project' ? 'by-project' : 'all');
      this.loadContributions();
    });
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
      const contributions = result?.edges?.map(edge => ({
        ...edge.node,
        project: edge.node.project ? {
          id: edge.node.project.id,
          title: edge.node.project.title
        } : null
      })) || [];
      
      this.contributions.set(contributions);
      this.pageInfo.set(result?.pageInfo || null);

      // Group contributions by project if needed
      if (this.viewType() === 'by-project') {
        this.groupContributionsByProject(contributions);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      this.loading.set(false);
    }
  }

  groupContributionsByProject(contributions: Array<any>) {
    const grouped = contributions.reduce((acc, contribution) => {
      const projectId = contribution.project?.id || 'unknown';
      const projectName = contribution.project?.title || 'Unknown Project';
      
      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          projectName,
          contributions: [],
          total: 0
        };
      }
      
      acc[projectId].contributions.push(contribution);
      acc[projectId].total += contribution.amount;
      
      return acc;
    }, {} as Record<string, any>);

    this.groupedContributions.set(Object.values(grouped));
  }

  getTitle(): string {
    return this.viewType() === 'by-project' 
      ? 'My Contributions by Project' 
      : 'All My Contributions';
  }

  getDescription(): string {
    return this.viewType() === 'by-project'
      ? 'View your contributions grouped by project'
      : 'View and manage all your contributions';
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
