import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import {
  IContributionFilter,
  IContributionPaginationInput, IPaymentStatus
} from '@nyots/data-source';
import { ContributionService, IGetContributionsQuery } from '@nyots/data-source/contributions';
import {
  PaymentStatusBadgeComponent,
  ContributionFiltersComponent,
  PaginationComponent,
  PageChangeEvent,
  PaginationInfo,
} from '../../components';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideEye,
  lucideCreditCard,
  lucideRefreshCw,
  lucideEdit,
  lucideMoreVertical,
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
import {
  HlmDropdownMenuImports,
} from '@nyots/ui/dropdown-menu';
import { HlmDialogService } from '@nyots/ui/dialog';
import { BulkStatusDialog, StatusUpdateDialog } from '@nyots/admin/ui/dialogs';

@Component({
  selector: 'nyots-contribution-list',
  standalone: true,
  imports: [
    CommonModule,
    PaymentStatusBadgeComponent,
    ContributionFiltersComponent,
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
    HlmDropdownMenuImports,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideEye,
      lucideCreditCard,
      lucideRefreshCw,
      lucideEdit,
      lucideMoreVertical,
    }),
  ],
  template: `
    <div class="space-y-4 md:space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">Contributions</h2>
          <p class="text-sm md:text-base text-muted-foreground">
            Manage and track all contributions
          </p>
        </div>
        <button hlmBtn (click)="navigateToCreate()" class="w-full sm:w-auto">
          <ng-icon hlmIcon name="lucidePlus" size="base" class="mr-2" />
          Record Contribution
        </button>
      </div>

      <!-- Filters -->
      <nyots-contribution-filters
        [filters]="filters()"
        [loading]="isLoading()"
        (filtersChange)="onFiltersChange($event)"
      />

      <!-- Bulk Actions Toolbar -->
      @if (hasSelection()) {
        <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">
              {{ selectedCount() }} contribution(s) selected
            </span>
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              (click)="clearSelection()"
            >
              Clear
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              hlmBtn
              variant="outline"
              size="sm"
              (click)="handleBulkStatusChange()"
              [disabled]="isLoading()"
            >
              <ng-icon hlmIcon name="lucideEdit" size="base" class="mr-2" />
              Update Status
            </button>
          </div>
        </div>
      }

      <!-- Table Card -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>All Contributions</h3>
          <p hlmCardDescription>
            @if (totalCount() !== undefined) {
              <span>{{ totalCount() }} total contributions</span>
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
                <p class="text-sm text-muted-foreground">Loading contributions...</p>
              </div>
            </div>
          } @else if (contributions().length === 0) {
            <div class="flex flex-col items-center justify-center py-12 text-center">
              <p class="text-lg font-medium">No contributions found</p>
              <p class="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or create a new contribution
              </p>
              <button hlmBtn variant="outline" class="mt-4" (click)="navigateToCreate()">
                <ng-icon hlmIcon name="lucidePlus" size="base" class="mr-2" />
                Record Contribution
              </button>
            </div>
          } @else {
            <!-- Desktop Table View (hidden on mobile) -->
            <div class="hidden md:block relative overflow-x-auto">
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
                    <th hlmTh
                      class="cursor-pointer hover:bg-muted/50"
                      (click)="sortBy('contributor')"
                    >
                      Contributor
                    </th>
                    <th hlmTh
                      class="cursor-pointer hover:bg-muted/50"
                      (click)="sortBy('project')"
                    >
                      Project
                    </th>
                    <th hlmTh
                      class="cursor-pointer hover:bg-muted/50"
                      (click)="sortBy('amount')"
                    >
                      Amount
                    </th>
                    <th hlmTh
                      class="cursor-pointer hover:bg-muted/50"
                      (click)="sortBy('status')"
                    >
                      Status
                    </th>
                    <th hlmTh
                      class="cursor-pointer hover:bg-muted/50"
                      (click)="sortBy('date')"
                    >
                      Date
                    </th>
                    <th hlmTh class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (contribution of contributions(); track contribution.id) {
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
                            {{ contribution.user.firstName }} {{ contribution.user.lastName }}
                          </span>
                          <span class="text-sm text-muted-foreground">
                            {{ contribution.user.email }}
                          </span>
                        </div>
                      </td>
                      <td hlmTd>
                        <div class="flex flex-col">
                          <span class="font-medium">{{ contribution.project.title }}</span>
                          @if (contribution.project.description) {
                            <span class="text-sm text-muted-foreground line-clamp-1">
                              {{ contribution.project.description }}
                            </span>
                          }
                        </div>
                      </td>
                      <td hlmTd>
                        <span class="font-medium">{{ contribution.amount | currency }}</span>
                      </td>
                      <td hlmTd>
                        <nyots-payment-status-badge [status]="contribution.paymentStatus" />
                      </td>
                      <td hlmTd>
                        <div class="flex flex-col">
                          <span>{{ contribution.createdAt | date: 'short' }}</span>
                          @if (contribution.paidAt) {
                            <span class="text-sm text-muted-foreground">
                              Paid: {{ contribution.paidAt | date: 'short' }}
                            </span>
                          }
                        </div>
                      </td>
                      <td hlmTd class="text-right">
                        <div class="flex items-center justify-end gap-2">
                          <!-- Quick Actions -->
                          <button
                            hlmBtn
                            variant="ghost"
                            size="sm"
                            (click)="viewDetails(contribution.id)"
                            [attr.aria-label]="'View contribution details'"
                          >
                            <ng-icon hlmIcon name="lucideEye" size="base" />
                          </button>

                          @if (contribution.paymentStatus === IPaymentStatus.Pending) {
                            <button
                              hlmBtn
                              variant="ghost"
                              size="sm"
                              (click)="processPayment(contribution.id)"
                              [attr.aria-label]="'Process payment'"
                            >
                              <ng-icon hlmIcon name="lucideCreditCard" size="base" />
                            </button>
                          }

                          @if (contribution.paymentStatus === IPaymentStatus.Paid) {
                            <button
                              hlmBtn
                              variant="ghost"
                              size="sm"
                              (click)="processRefund(contribution.id)"
                              [attr.aria-label]="'Process refund'"
                            >
                              <ng-icon hlmIcon name="lucideRefreshCw" size="base" />
                            </button>
                          }

                          <!-- More Actions Menu -->
                          <button
                            hlmBtn
                            variant="ghost"
                            size="sm"
                            [hlmDropdownMenuTrigger]="actionsMenu"
                            [attr.aria-label]="'More actions'"
                          >
                            <ng-icon hlmIcon name="lucideMoreVertical" size="base" />
                          </button>

                          <ng-template #actionsMenu>
                            <hlm-dropdown-menu class="w-48">
                              <button hlmDropdownMenuItem (click)="viewDetails(contribution.id)">
                                <ng-icon hlmIcon name="lucideEye" size="base" class="mr-2" />
                                View Details
                              </button>
                              <button hlmDropdownMenuItem (click)="updateStatus(contribution.id, contribution.paymentStatus)">
                                <ng-icon name="lucideEdit" size="16" class="mr-2" />
                                Update Status
                              </button>
                              @if (contribution.paymentStatus === IPaymentStatus.Pending) {
                                <hlm-dropdown-menu-separator />
                                <button hlmDropdownMenuItem (click)="processPayment(contribution.id)">
                                  <ng-icon hlmIcon name="lucideCreditCard" size="base" class="mr-2" />
                                  Process Payment
                                </button>
                              }
                              @if (contribution.paymentStatus === IPaymentStatus.Paid) {
                                <hlm-dropdown-menu-separator />
                                <button hlmDropdownMenuItem (click)="processRefund(contribution.id)">
                                  <ng-icon hlmIcon name="lucideRefreshCw" size="base" class="mr-2" />
                                  Process Refund
                                </button>
                              }
                            </hlm-dropdown-menu>
                          </ng-template>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View (visible on mobile) -->
            <div class="md:hidden space-y-4">
              @for (contribution of contributions(); track contribution.id) {
                <div class="border rounded-lg p-4 space-y-3">
                  <!-- Header with checkbox and status -->
                  <div class="flex items-start justify-between">
                    <div class="flex items-start gap-3 flex-1">
                      <hlm-checkbox
                        [checked]="isSelected(contribution.id)"
                        (change)="toggleSelection(contribution.id)"
                        [attr.aria-label]="'Select contribution'"
                        class="mt-1"
                      />
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate">
                          {{ contribution.user.firstName }} {{ contribution.user.lastName }}
                        </p>
                        <p class="text-sm text-muted-foreground truncate">
                          {{ contribution.user.email }}
                        </p>
                      </div>
                    </div>
                    <nyots-payment-status-badge [status]="contribution.paymentStatus" />
                  </div>

                  <!-- Project and Amount -->
                  <div class="space-y-2">
                    <div>
                      <p class="text-xs text-muted-foreground">Project</p>
                      <p class="text-sm font-medium">{{ contribution.project.title }}</p>
                    </div>
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="text-xs text-muted-foreground">Amount</p>
                        <p class="text-lg font-bold">{{ contribution.amount | currency }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-xs text-muted-foreground">Date</p>
                        <p class="text-sm">{{ contribution.createdAt | date: 'short' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2 pt-2 border-t">
                    <button
                      hlmBtn
                      variant="outline"
                      size="sm"
                      (click)="viewDetails(contribution.id)"
                      class="flex-1"
                    >
                      <ng-icon hlmIcon name="lucideEye" size="base" class="mr-2" />
                      View
                    </button>
                    @if (contribution.paymentStatus === IPaymentStatus.Pending) {
                      <button
                        hlmBtn
                        variant="default"
                        size="sm"
                        (click)="processPayment(contribution.id)"
                        class="flex-1"
                      >
                        <ng-icon hlmIcon name="lucideCreditCard" size="base" class="mr-2" />
                        Pay
                      </button>
                    }
                    @if (contribution.paymentStatus === IPaymentStatus.Paid) {
                      <button
                        hlmBtn
                        variant="destructive"
                        size="sm"
                        (click)="processRefund(contribution.id)"
                        class="flex-1"
                      >
                        <ng-icon hlmIcon name="lucideRefreshCw" size="base" class="mr-2" />
                        Refund
                      </button>
                    }
                  </div>
                </div>
              }
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
  styles: [`
    :host {
      display: block;
    }

    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class ContributionListComponent {
  private readonly contributionService = inject(ContributionService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(HlmDialogService);

  // State management using signals
  // contributions = signal<IContribution[]>([]);
  contributions = signal<IGetContributionsQuery['getContributions']['edges'][number]['node'][]>([]);
  isLoading = signal(false);
  selectedContributions = signal<Set<string>>(new Set());

  // Filter state
  filters = signal<IContributionFilter>({});

  // Pagination state
  pageSize = signal<number>(20);
  totalCount = signal<number | undefined>(undefined);
  totalAmount = signal<number | undefined>(undefined);
  paginationInfo = signal<PaginationInfo | null>(null);
  currentCursor = signal<string | null>(null);
  // Add this signal
  paginationDirection = signal<'forward' | 'backward'>('forward');

  // Sorting state
  sortField = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Computed properties
  selectedCount = computed(() => this.selectedContributions().size);
  hasSelection = computed(() => this.selectedCount() > 0);
  allSelected = computed(() => {
    const contributions = this.contributions();
    const selected = this.selectedContributions();
    return contributions.length > 0 && contributions.every(c => selected.has(c.id));
  });
  someSelected = computed(() => {
    const selected = this.selectedContributions();
    return selected.size > 0 && !this.allSelected();
  });

  constructor() {
    // Load initial data
    this.loadContributions();
  }

  /**
   * Load contributions with current filters and pagination
   */
  async loadContributions() {
    this.isLoading.set(true);

    try {
      // Build pagination object
      const pagination: IContributionPaginationInput = {
        first: this.pageSize(),
        sortBy: this.sortField() || undefined,
        sortOrder: this.sortDirection()?.toUpperCase() as 'ASC' | 'DESC' || undefined,
      };

      if (this.currentCursor()) {
        pagination.after = this.currentCursor() || undefined;
      }

      const result = await this.contributionService.getContributions({
        filter: this.filters(),
        pagination,
      });

      if (result) {
        this.contributions.set(result.edges.map(edge => edge.node));
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
      console.error('Error loading contributions:', error);
      toast.error('Failed to load contributions. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle filter changes
   */
  onFiltersChange(filters: IContributionFilter) {
    this.filters.set(filters);
    this.currentCursor.set(null); // Reset to first page
    this.clearSelection();
    this.loadContributions();
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

    this.loadContributions();
  }
  /**
   * Sort by field
   */
  sortBy(field: string) {
    if (this.sortField() === field) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadContributions();
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
      const allIds = this.contributions().map(c => c.id);
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
   * Handle bulk status change
   */
  async handleBulkStatusChange() {
    const selectedIds = Array.from(this.selectedContributions());
    if (selectedIds.length === 0) {
      toast.error('No contributions selected');
      return;
    }

    // Determine a common current status if possible, or use a default
    const firstSelectedContribution = this.contributions().find(c => c.id === selectedIds[0]);
    const currentStatus = firstSelectedContribution ? (firstSelectedContribution.paymentStatus) : 'pending'; // Default or infer

    const dialogRef = this.dialogService.open(BulkStatusDialog, {
      context: { contributionIds: selectedIds, currentStatus },
    });

    dialogRef.closed$.subscribe(result => {
      if (result) {
        toast.success('Bulk status update initiated.');
        this.clearSelection();
        this.loadContributions();
      }
    });
  }

  /**
   * Navigate to create contribution page
   */
  navigateToCreate() {
    this.router.navigate(['/dashboard/contributions/new']);
  }

  /**
   * View contribution details
   */
  viewDetails(contributionId: string) {
    this.router.navigate(['/dashboard/contributions', contributionId]);
  }

  /**
   * Process payment for a contribution
   */
  async processPayment(contributionId: string) {
    console.log('Process payment for contribution:', contributionId);
    toast.info('Payment processing coming soon');
  }

  /**
   * Process refund for a contribution
   */
  async processRefund(contributionId: string) {
    console.log('Process refund for contribution:', contributionId);
    toast.info('Refund processing coming soon');
  }

  /**
   * Update contribution status
   */
  async updateStatus(contributionId: string, currentStatus: IPaymentStatus) {
    const dialogRef = this.dialogService.open(StatusUpdateDialog, {
      context: { contributionId, currentStatus: currentStatus },
    });

    dialogRef.closed$.subscribe(result => {
      if (result) {
        toast.success('Contribution status updated.');
        this.loadContributions();
      }
    });
  }

  protected readonly IPaymentStatus = IPaymentStatus;
}
