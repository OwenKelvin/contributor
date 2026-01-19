import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import {
  IContributionFilter,
  IContributionPaginationInput,
  IPaymentStatus,
} from '@nyots/data-source';
import { ContributionService, IGetContributionsQuery } from '@nyots/data-source/contributions';
import {
  PaginationComponent,
  PageChangeEvent,
  PaginationInfo,
} from '../../components';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCreditCard,
  lucideCheckCircle,
  lucideEye,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import {
  HlmTable,
  HlmTHead,
  HlmTBody,
  HlmTr,
  HlmTh,
  HlmTd,
} from '@nyots/ui/table';
import { HlmCheckbox } from '@nyots/ui/checkbox';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { CurrencyPipe, DatePipe } from '@angular/common';

type ContributionNode = NonNullable<
  NonNullable<IGetContributionsQuery['getContributions']>['edges'][0]['node']
>;

/**
 * Component for displaying and managing pending contributions.
 * Allows bulk payment processing and marking contributions as paid.
 */
@Component({
  selector: 'nyots-pending-contributions',
  standalone: true,
  imports: [
    PaginationComponent,
    HlmButton,
    HlmIcon,
    NgIcon,
    HlmTable,
    HlmTHead,
    HlmTBody,
    HlmTr,
    HlmTh,
    HlmTd,
    HlmCheckbox,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    CurrencyPipe,
    DatePipe,
  ],
  providers: [
    provideIcons({
      lucideCreditCard,
      lucideCheckCircle,
      lucideEye,
      lucideRefreshCw,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">
            Pending Contributions
          </h2>
          <p class="text-muted-foreground">
            Manage contributions awaiting payment
          </p>
        </div>
      </div>

      <!-- Bulk Actions Toolbar -->
      @if (hasSelection()) {
        <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">
              {{ selectedCount() }} contribution(s) selected
            </span>
            <button hlmBtn variant="ghost" size="sm" (click)="clearSelection()">
              Clear
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              hlmBtn
              variant="default"
              size="sm"
              (click)="handleBulkProcessPayment()"
              [disabled]="isLoading() || isProcessing()"
            >
              <ng-icon
                hlmIcon
                name="lucideCreditCard"
                size="base"
                class="mr-2"
              />
              Process Payment
            </button>
            <button
              hlmBtn
              variant="outline"
              size="sm"
              (click)="handleBulkMarkAsPaid()"
              [disabled]="isLoading() || isProcessing()"
            >
              <ng-icon
                hlmIcon
                name="lucideCheckCircle"
                size="base"
                class="mr-2"
              />
              Mark as Paid
            </button>
          </div>
        </div>
      }

      <!-- Table Card -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Pending Contributions</h3>
          <p hlmCardDescription>
            @if (totalCount() !== undefined) {
              <span>{{ totalCount() }} pending contributions</span>
              @if (totalAmount() !== undefined) {
                <span> • Total: {{ totalAmount() | currency }}</span>
              }
            }
          </p>
        </div>
        <div hlmCardContent>
          @if (isLoading()) {
            <div class="flex items-center justify-center py-12">
              <div class="flex flex-col items-center gap-2">
                <ng-icon
                  hlmIcon
                  name="lucideRefreshCw"
                  size="lg"
                  class="animate-spin text-muted-foreground"
                />
                <p class="text-sm text-muted-foreground">
                  Loading pending contributions...
                </p>
              </div>
            </div>
          } @else if (contributions().length === 0) {
            <div
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <p class="text-lg font-medium">No pending contributions</p>
              <p class="text-sm text-muted-foreground mt-1">
                All contributions have been processed
              </p>
            </div>
          } @else {
            <!-- Table -->
            <div class="relative overflow-x-auto">
              <table hlmTable>
                <thead hlmTHead>
                  <tr hlmTr>
                    <th hlmTh class="w-12">
                      <hlm-checkbox
                        [checked]="allSelected()"
                        [indeterminate]="someSelected()"
                        (change)="toggleSelectAll()"
                        [attr.aria-label]="'Select all contributions'"
                      />
                    </th>
                    <th hlmTh>Contributor</th>
                    <th hlmTh>Project</th>
                    <th hlmTh>Amount</th>
                    <th hlmTh>Date</th>
                    <th hlmTh class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (
                    contribution of contributions();
                    track contribution.id
                  ) {
                    <tr hlmTr>
                      <td hlmTd>
                        <hlm-checkbox
                          [checked]="isSelected(contribution.id)"
                          (change)="toggleSelection(contribution.id)"
                          [attr.aria-label]="'Select contribution'"
                        />
                      </td>
                      <td hlmTd>
                        <div class="flex flex-col">
                          <span class="font-medium">
                            {{ contribution.user.firstName }}
                            {{ contribution.user.lastName }}
                          </span>
                          <span class="text-sm text-muted-foreground">
                            {{ contribution.user.email }}
                          </span>
                        </div>
                      </td>
                      <td hlmTd>
                        <div class="flex flex-col">
                          <span class="font-medium">{{
                            contribution.project.title
                          }}</span>
                          @if (contribution.project.description) {
                            <span
                              class="text-sm text-muted-foreground line-clamp-1"
                            >
                              {{ contribution.project.description }}
                            </span>
                          }
                        </div>
                      </td>
                      <td hlmTd>
                        <span class="font-medium">{{
                          contribution.amount | currency
                        }}</span>
                      </td>
                      <td hlmTd>
                        <span>{{
                          contribution.createdAt | date: 'short'
                        }}</span>
                      </td>
                      <td hlmTd class="text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            hlmBtn
                            variant="ghost"
                            size="sm"
                            (click)="viewDetails(contribution.id)"
                            [attr.aria-label]="'View contribution details'"
                          >
                            <ng-icon hlmIcon name="lucideEye" size="base" />
                          </button>
                          <button
                            hlmBtn
                            variant="default"
                            size="sm"
                            (click)="processPayment(contribution.id)"
                            [disabled]="isProcessing()"
                            [attr.aria-label]="'Process payment'"
                          >
                            <ng-icon
                              hlmIcon
                              name="lucideCreditCard"
                              size="base"
                              class="mr-2"
                            />
                            Process
                          </button>
                          <button
                            hlmBtn
                            variant="outline"
                            size="sm"
                            (click)="markAsPaid(contribution.id)"
                            [disabled]="isProcessing()"
                            [attr.aria-label]="'Mark as paid'"
                          >
                            <ng-icon
                              hlmIcon
                              name="lucideCheckCircle"
                              size="base"
                              class="mr-2"
                            />
                            Mark Paid
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nyots-pagination
              [pageInfo]="paginationInfo()"
              [pageSize]="pageSize()"
              [loading]="isLoading()"
              (pageChange)="onPageChange($event)"
            />
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class PendingContributionsComponent {
  private readonly contributionService = inject(ContributionService);
  private readonly router = inject(Router);

  // State management using signals
  contributions = signal<ContributionNode[]>([]);
  isLoading = signal(false);
  isProcessing = signal(false);
  selectedContributions = signal<Set<string>>(new Set());

  // Pagination state
  pageSize = signal<number>(20);
  totalCount = signal<number | undefined>(undefined);
  totalAmount = signal<number | undefined>(undefined);
  paginationInfo = signal<PaginationInfo | null>(null);
  currentCursor = signal<string | null>(null);

  paginationDirection = signal<'forward' | 'backward'>('forward');

  // Computed properties
  selectedCount = computed(() => this.selectedContributions().size);
  hasSelection = computed(() => this.selectedCount() > 0);
  allSelected = computed(() => {
    const contributions = this.contributions();
    const selected = this.selectedContributions();
    return (
      contributions.length > 0 && contributions.every((c) => selected.has(c.id))
    );
  });
  someSelected = computed(() => {
    const selected = this.selectedContributions();
    return selected.size > 0 && !this.allSelected();
  });

  constructor() {
    // Load initial data
    this.loadPendingContributions();
  }

  /**
   * Load pending contributions with pagination
   */
  async loadPendingContributions() {
    this.isLoading.set(true);

    try {
      // Build filter for pending status
      const filter: IContributionFilter = {
        paymentStatus: IPaymentStatus.Pending,
      };

      // Build pagination object
      const pagination: IContributionPaginationInput = {
        first: this.pageSize(),
      };

      if (this.currentCursor()) {
        pagination.after = this.currentCursor() || undefined;
      }

      const result = await this.contributionService.getContributions({
        filter,
        pagination,
      });

      if (result) {
        this.contributions.set(result.edges.map((edge) => edge.node));
        this.totalCount.set(result.totalCount);
        this.totalAmount.set(result.totalAmount);

        // Build pagination info
        const pageInfo: PaginationInfo = {
          hasNextPage: result.pageInfo.hasNextPage,
          hasPreviousPage: result.pageInfo.hasPreviousPage,
          endCursor: result.pageInfo.endCursor || null,
          startCursor: result.pageInfo.startCursor || null,
          totalCount: result.totalCount,
          currentPageSize: result.edges.length,
        };
        this.paginationInfo.set(pageInfo);
      }
    } catch (error) {
      console.error('Error loading pending contributions:', error);
      toast.error('Failed to load pending contributions. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageChangeEvent) {
    if (event.pageSize) {
      this.pageSize.set(event.pageSize);
    }

    switch (event.direction) {
      case 'next':
        // Use endCursor for forward pagination (after parameter)
        this.currentCursor.set(event.endCursor || null);
        this.paginationDirection.set('forward');
        break;
      case 'previous':
        // Use startCursor for backward pagination (before parameter)
        this.currentCursor.set(event.startCursor || null);
        this.paginationDirection.set('backward');
        break;
      case 'first':
        // Reset to first page
        this.currentCursor.set(null);
        this.paginationDirection.set('forward');
        break;
      case 'last':
        // For last page, we'd need to implement reverse pagination
        // For now, just stay on current page
        break;
    }

    this.loadPendingContributions();
  }

  /**
   * Check if contribution is selected
   */
  isSelected(id: string): boolean {
    return this.selectedContributions().has(id);
  }

  /**
   * Toggle selection for a contribution
   */
  toggleSelection(id: string) {
    const selected = new Set(this.selectedContributions());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedContributions.set(selected);
  }

  /**
   * Toggle select all
   */
  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedContributions.set(new Set());
    } else {
      const allIds = this.contributions().map((c) => c.id);
      this.selectedContributions.set(new Set(allIds));
    }
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedContributions.set(new Set());
  }

  /**
   * Handle bulk process payment
   */
  async handleBulkProcessPayment() {
    const selectedIds = Array.from(this.selectedContributions());
    if (selectedIds.length === 0) {
      toast.error('No contributions selected');
      return;
    }

    // Confirm action
    if (
      !confirm(`Process payment for ${selectedIds.length} contribution(s)?`)
    ) {
      return;
    }

    this.isProcessing.set(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      // Process each contribution
      for (const id of selectedIds) {
        try {
          // TODO: Get phone number from user input dialog
          // For now, this is a placeholder - in production, you'd need to collect phone numbers
          await this.contributionService.processPayment(id, {
            phoneNumber: '254700000000', // Placeholder - should be collected from user
            accountReference: id,
            transactionDesc: 'Bulk payment processing',
          });
          successCount++;
        } catch (error) {
          console.error(
            `Error processing payment for contribution ${id}:`,
            error,
          );
          failureCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} payment(s)`);
      }
      if (failureCount > 0) {
        toast.error(`Failed to process ${failureCount} payment(s)`);
      }

      // Reload data and clear selection
      this.clearSelection();
      await this.loadPendingContributions();
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Handle bulk mark as paid (for offline payments)
   */
  async handleBulkMarkAsPaid() {
    const selectedIds = Array.from(this.selectedContributions());
    if (selectedIds.length === 0) {
      toast.error('No contributions selected');
      return;
    }

    // Confirm action
    if (
      !confirm(
        `Mark ${selectedIds.length} contribution(s) as paid? This is for offline payments only.`,
      )
    ) {
      return;
    }

    this.isProcessing.set(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      // Update status for each contribution
      for (const id of selectedIds) {
        try {
          await this.contributionService.updateStatus(id, IPaymentStatus.Paid);
          successCount++;
        } catch (error) {
          console.error(`Error marking contribution ${id} as paid:`, error);
          failureCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(
          `Successfully marked ${successCount} contribution(s) as paid`,
        );
      }
      if (failureCount > 0) {
        toast.error(`Failed to mark ${failureCount} contribution(s) as paid`);
      }

      // Reload data and clear selection
      this.clearSelection();
      await this.loadPendingContributions();
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * View contribution details
   */
  viewDetails(contributionId: string) {
    this.router.navigate(['/dashboard/contributions', contributionId]);
  }

  /**
   * Process payment for a single contribution
   */
  async processPayment(contributionId: string) {
    this.isProcessing.set(true);

    try {
      // TODO: Get phone number from user input dialog
      // For now, this is a placeholder - in production, you'd need to collect phone numbers
      await this.contributionService.processPayment(contributionId, {
        phoneNumber: '254700000000', // Placeholder - should be collected from user
        accountReference: contributionId,
        transactionDesc: 'Payment processing',
      });
      toast.success('Payment processed successfully');
      await this.loadPendingContributions();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Mark a single contribution as paid (for offline payments)
   */
  async markAsPaid(contributionId: string) {
    // Confirm action
    if (
      !confirm(
        'Mark this contribution as paid? This is for offline payments only.',
      )
    ) {
      return;
    }

    this.isProcessing.set(true);

    try {
      await this.contributionService.updateStatus(
        contributionId,
        IPaymentStatus.Paid,
      );
      toast.success('Contribution marked as paid');
      await this.loadPendingContributions();
    } catch (error) {
      console.error('Error marking contribution as paid:', error);
      toast.error('Failed to mark contribution as paid. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
