import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import {
  IContribution,
  IContributionFilter,
  IContributionPaginationInput,
} from '@nyots/data-source';
import { ContributionService } from '@nyots/data-source/contributions';
import {
  PaymentStatusBadgeComponent,
  ContributionFiltersComponent,
  PaginationComponent,
  PageChangeEvent,
  PaginationInfo,
  ContributionFormDialogComponent,
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
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Contributions</h2>
          <p class="text-muted-foreground">
            Manage and track all contributions
          </p>
        </div>
        <button hlmBtn (click)="navigateToCreate()">
          <ng-icon name="lucidePlus" size="16" class="mr-2" />
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
              <ng-icon name="lucideEdit" size="16" class="mr-2" />
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
                  name="lucideRefreshCw"
                  size="32"
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
                <ng-icon name="lucidePlus" size="16" class="mr-2" />
                Record Contribution
              </button>
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
                        (changed)="toggleSelectAll()"
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
                          (changed)="toggleSelection(contribution.id)"
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
                            <ng-icon name="lucideEye" size="16" />
                          </button>

                          @if (contribution.paymentStatus === 'PENDING') {
                            <button
                              hlmBtn
                              variant="ghost"
                              size="sm"
                              (click)="processPayment(contribution.id)"
                              [attr.aria-label]="'Process payment'"
                            >
                              <ng-icon name="lucideCreditCard" size="16" />
                            </button>
                          }

                          @if (contribution.paymentStatus === 'PAID') {
                            <button
                              hlmBtn
                              variant="ghost"
                              size="sm"
                              (click)="processRefund(contribution.id)"
                              [attr.aria-label]="'Process refund'"
                            >
                              <ng-icon name="lucideRefreshCw" size="16" />
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
                            <ng-icon name="lucideMoreVertical" size="16" />
                          </button>

                          <ng-template #actionsMenu>
                            <hlm-dropdown-menu class="w-48">
                              <button hlmDropdownMenuItem (click)="viewDetails(contribution.id)">
                                <ng-icon name="lucideEye" size="16" class="mr-2" />
                                View Details
                              </button>
                              <button hlmDropdownMenuItem (click)="updateStatus(contribution.id)">
                                <ng-icon name="lucideEdit" size="16" class="mr-2" />
                                Update Status
                              </button>
                              @if (contribution.paymentStatus === 'PENDING') {
                                <hlm-dropdown-menu-separator />
                                <button hlmDropdownMenuItem (click)="processPayment(contribution.id)">
                                  <ng-icon name="lucideCreditCard" size="16" class="mr-2" />
                                  Process Payment
                                </button>
                              }
                              @if (contribution.paymentStatus === 'PAID') {
                                <hlm-dropdown-menu-separator />
                                <button hlmDropdownMenuItem (click)="processRefund(contribution.id)">
                                  <ng-icon name="lucideRefreshCw" size="16" class="mr-2" />
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

  // State management using signals
  contributions = signal<IContribution[]>([]);
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
          cursor: result.edges[result.edges.length - 1]?.cursor || null,
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
        this.currentCursor.set(event.cursor || null);
        break;
      case 'previous':
      case 'first':
        this.currentCursor.set(null);
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

    // Apply sorting (in a real implementation, this would be done server-side)
    const contributions = [...this.contributions()];
    contributions.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (field) {
        case 'contributor':
          aValue = `${a.user.firstName} ${a.user.lastName}`.toLowerCase();
          bValue = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
          break;
        case 'project':
          aValue = a.project.title.toLowerCase();
          bValue = b.project.title.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.paymentStatus;
          bValue = b.paymentStatus;
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortDirection() === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });

    this.contributions.set(contributions);
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

    // TODO: Implement status selection dialog
    toast.info('Bulk status change coming soon');
  }

  /**
   * Navigate to create contribution page
   * 
   * Alternative: Use dialog instead of navigation
   * To use the dialog approach, uncomment the following code and inject HlmDialogService:
   * 
   * private dialogService = inject(HlmDialogService);
   * 
   * openCreateDialog() {
   *   const dialogRef = this.dialogService.open(ContributionFormDialogComponent, {
   *     context: {},
   *   });
   * 
   *   // Listen for successful creation
   *   dialogRef.closed$.subscribe((contribution) => {
   *     if (contribution) {
   *       // Reload contributions list
   *       this.loadContributions();
   *     }
   *   });
   * }
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
    // TODO: Implement payment processing dialog
    console.log('Process payment for contribution:', contributionId);
    toast.info('Payment processing coming soon');
  }

  /**
   * Process refund for a contribution
   */
  async processRefund(contributionId: string) {
    // TODO: Implement refund processing dialog
    console.log('Process refund for contribution:', contributionId);
    toast.info('Refund processing coming soon');
  }

  /**
   * Update contribution status
   */
  async updateStatus(contributionId: string) {
    // TODO: Implement status update dialog
    console.log('Update status for contribution:', contributionId);
    toast.info('Status update coming soon');
  }
}
