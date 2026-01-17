import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import {
  ITransactionFilterInput,
  IContributionPaginationInput,
  ITransactionStatus,
  ITransactionType,
} from '@nyots/data-source';
import { ContributionService, IGetTransactionsQuery } from '@nyots/data-source/contributions';
import {
  PaginationComponent,
  PageChangeEvent,
  PaginationInfo,
} from '../../components';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideRefreshCw,
  lucideEye,
  lucideAlertCircle,
  lucideCheckCircle,
  lucideClock,
} from '@ng-icons/lucide';
import {
  HlmTable,
  HlmTHead,
  HlmTBody,
  HlmTr,
  HlmTh,
  HlmTd,
} from '@nyots/ui/table';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmBadge } from '@nyots/ui/badge';
import { HlmLabel } from '@nyots/ui/label';
import { HlmInput } from '@nyots/ui/input';
import {
  HlmSelect,
  HlmSelectContent,
  HlmSelectOption,
  HlmSelectTrigger,
  HlmSelectValue,
} from '@nyots/ui/select';
import { HlmSpinner } from '@nyots/ui/spinner';

type TransactionNode = NonNullable<
  NonNullable<IGetTransactionsQuery['getTransactions']>['edges'][0]['node']
>;

/**
 * Transaction Logs Component
 * 
 * Displays all payment transactions with comprehensive filtering and search capabilities.
 * Shows transaction details including gateway responses and error information.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.6
 */
@Component({
  selector: 'nyots-transaction-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmBadge,
    HlmLabel,
    HlmInput,
    HlmSelect,
    HlmSelectContent,
    HlmSelectOption,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmSpinner,
  ],
  providers: [
    provideIcons({
      lucideRefreshCw,
      lucideEye,
      lucideAlertCircle,
      lucideCheckCircle,
      lucideClock,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Transaction Logs</h2>
        <p class="text-muted-foreground">
          View all payment transactions and gateway responses
        </p>
      </div>

      <!-- Filters Card -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Filters</h3>
          <p hlmCardDescription>
            Filter transactions by status, type, date range, or gateway ID
          </p>
        </div>
        <div hlmCardContent>
          <form [formGroup]="filterForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Transaction Status Filter -->
              <div class="space-y-2">
                <label hlmLabel for="status">Status</label>
                <select
                  hlmSelect
                  id="status"
                  formControlName="status"
                  class="w-full"
                >
                  <option value="">All Statuses</option>
                  <option [value]="TransactionStatus.Pending">Pending</option>
                  <option [value]="TransactionStatus.Success">Success</option>
                  <option [value]="TransactionStatus.Failed">Failed</option>
                </select>
              </div>

              <!-- Transaction Type Filter -->
              <div class="space-y-2">
                <label hlmLabel for="type">Type</label>
                <select
                  hlmSelect
                  id="type"
                  formControlName="transactionType"
                  class="w-full"
                >
                  <option value="">All Types</option>
                  <option [value]="TransactionType.Payment">Payment</option>
                  <option [value]="TransactionType.Refund">Refund</option>
                </select>
              </div>

              <!-- Start Date Filter -->
              <div class="space-y-2">
                <label hlmLabel for="startDate">Start Date</label>
                <input
                  hlmInput
                  type="date"
                  id="startDate"
                  formControlName="startDate"
                  class="w-full"
                />
              </div>

              <!-- End Date Filter -->
              <div class="space-y-2">
                <label hlmLabel for="endDate">End Date</label>
                <input
                  hlmInput
                  type="date"
                  id="endDate"
                  formControlName="endDate"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Search by Gateway Transaction ID -->
            <div class="space-y-2">
              <label hlmLabel for="search">Search by Gateway Transaction ID</label>
              <input
                hlmInput
                type="text"
                id="search"
                formControlName="search"
                placeholder="Enter gateway transaction ID..."
                class="w-full"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <button
                hlmBtn
                type="button"
                variant="default"
                (click)="applyFilters()"
                [disabled]="isLoading()"
              >
                <ng-icon hlmIcon name="lucideRefreshCw" size="base" class="mr-2" />
                Apply Filters
              </button>
              <button
                hlmBtn
                type="button"
                variant="outline"
                (click)="resetFilters()"
                [disabled]="isLoading()"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Table Card -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Transaction History</h3>
          <p hlmCardDescription>
            @if (totalCount() !== undefined) {
              <span>{{ totalCount() }} total transactions</span>
            }
          </p>
        </div>
        <div hlmCardContent>
          @if (isLoading()) {
            <div class="flex items-center justify-center py-12">
              <div class="flex flex-col items-center gap-2">
                <hlm-spinner />
                <p class="text-sm text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          } @else if (transactions().length === 0) {
            <div class="flex flex-col items-center justify-center py-12 text-center">
              <p class="text-lg font-medium">No transactions found</p>
              <p class="text-sm text-muted-foreground mt-1">
                Try adjusting your filters to see more results
              </p>
            </div>
          } @else {
            <!-- Table -->
            <div class="relative overflow-x-auto">
              <table hlmTable>
                <thead hlmTHead>
                  <tr hlmTr>
                    <th hlmTh>Contribution</th>
                    <th hlmTh>Type</th>
                    <th hlmTh>Amount</th>
                    <th hlmTh>Status</th>
                    <th hlmTh>Gateway ID</th>
                    <th hlmTh>Timestamp</th>
                    <th hlmTh class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (transaction of transactions(); track transaction.id) {
                    <tr hlmTr>
                      <!-- Contribution Info -->
                      <td hlmTd>
                        <div class="flex flex-col">
                          <span class="font-medium">
                            {{ transaction.contribution.user.firstName }} 
                            {{ transaction.contribution.user.lastName }}
                          </span>
                          <span class="text-sm text-muted-foreground">
                            {{ transaction.contribution.project.title }}
                          </span>
                        </div>
                      </td>

                      <!-- Transaction Type -->
                      <td hlmTd>
                        <span
                          hlmBadge
                          [variant]="transaction.transactionType === TransactionType.Payment ? 'default' : 'secondary'"
                        >
                          {{ transaction.transactionType }}
                        </span>
                      </td>

                      <!-- Amount -->
                      <td hlmTd>
                        <span class="font-medium">{{ transaction.amount | currency }}</span>
                      </td>

                      <!-- Status -->
                      <td hlmTd>
                        <div class="flex items-center gap-2">
                          @switch (transaction.status) {
                            @case (TransactionStatus.Success) {
                              <ng-icon
                                hlmIcon
                                name="lucideCheckCircle"
                                size="base"
                                class="text-green-600"
                              />
                              <span hlmBadge variant="default" class="bg-green-600">
                                Success
                              </span>
                            }
                            @case (TransactionStatus.Failed) {
                              <ng-icon
                                hlmIcon
                                name="lucideAlertCircle"
                                size="base"
                                class="text-red-600"
                              />
                              <span hlmBadge variant="destructive">
                                Failed
                              </span>
                            }
                            @case (TransactionStatus.Pending) {
                              <ng-icon
                                hlmIcon
                                name="lucideClock"
                                size="base"
                                class="text-yellow-600"
                              />
                              <span hlmBadge variant="outline" class="border-yellow-600 text-yellow-600">
                                Pending
                              </span>
                            }
                          }
                        </div>
                      </td>

                      <!-- Gateway Transaction ID -->
                      <td hlmTd>
                        @if (transaction.gatewayTransactionId) {
                          <code class="text-xs bg-muted px-2 py-1 rounded">
                            {{ transaction.gatewayTransactionId }}
                          </code>
                        } @else {
                          <span class="text-sm text-muted-foreground">N/A</span>
                        }
                      </td>

                      <!-- Timestamp -->
                      <td hlmTd>
                        <span>{{ transaction.createdAt | date: 'short' }}</span>
                      </td>

                      <!-- Actions -->
                      <td hlmTd class="text-right">
                        <button
                          hlmBtn
                          variant="ghost"
                          size="sm"
                          (click)="viewTransactionDetails(transaction)"
                          [attr.aria-label]="'View transaction details'"
                        >
                          <ng-icon hlmIcon name="lucideEye" size="base" />
                        </button>
                      </td>
                    </tr>

                    <!-- Error Details Row (for failed transactions) -->
                    @if (transaction.status === TransactionStatus.Failed && 
                         (transaction.errorCode || transaction.errorMessage) &&
                         expandedTransactionId() === transaction.id) {
                      <tr hlmTr class="bg-red-50 dark:bg-red-950/20">
                        <td hlmTd colspan="7">
                          <div class="p-4 space-y-2">
                            <div class="flex items-start gap-2">
                              <ng-icon
                                hlmIcon
                                name="lucideAlertCircle"
                                size="base"
                                class="text-red-600 mt-0.5"
                              />
                              <div class="flex-1">
                                <p class="font-medium text-sm text-red-900 dark:text-red-100">
                                  Transaction Failed
                                </p>
                                @if (transaction.errorCode) {
                                  <p class="text-sm text-red-800 dark:text-red-200 mt-1">
                                    <span class="font-medium">Error Code:</span> 
                                    <code class="bg-red-100 dark:bg-red-900 px-2 py-0.5 rounded">
                                      {{ transaction.errorCode }}
                                    </code>
                                  </p>
                                }
                                @if (transaction.errorMessage) {
                                  <p class="text-sm text-red-800 dark:text-red-200 mt-1">
                                    <span class="font-medium">Error Message:</span> 
                                    {{ transaction.errorMessage }}
                                  </p>
                                }
                                @if (transaction.gatewayResponse) {
                                  <details class="mt-2">
                                    <summary class="text-sm font-medium text-red-900 dark:text-red-100 cursor-pointer">
                                      Gateway Response
                                    </summary>
                                    <pre class="text-xs bg-red-100 dark:bg-red-900 p-2 rounded mt-1 overflow-x-auto">{{ transaction.gatewayResponse }}</pre>
                                  </details>
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    }
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

    code {
      font-family: 'Courier New', Courier, monospace;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `],
})
export class TransactionLogsComponent {
  private readonly contributionService = inject(ContributionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Expose enums to template
  readonly TransactionStatus = ITransactionStatus;
  readonly TransactionType = ITransactionType;

  // State management using signals
  transactions = signal<TransactionNode[]>([]);
  isLoading = signal(false);
  expandedTransactionId = signal<string | null>(null);

  // Pagination state
  pageSize = signal<number>(20);
  totalCount = signal<number | undefined>(undefined);
  paginationInfo = signal<PaginationInfo | null>(null);
  currentCursor = signal<string | null>(null);
  paginationDirection = signal<'forward' | 'backward'>('forward');

  // Filter form
  filterForm = this.fb.group({
    status: [''],
    transactionType: [''],
    startDate: [''],
    endDate: [''],
    search: [''],
  });

  constructor() {
    // Load initial data
    this.loadTransactions();
  }

  /**
   * Load transactions with current filters and pagination
   */
  async loadTransactions() {
    this.isLoading.set(true);

    try {
      // Build filter object from form
      const filter: ITransactionFilterInput = {};
      const formValue = this.filterForm.value;

      if (formValue.status) {
        filter.status = formValue.status as ITransactionStatus;
      }

      if (formValue.transactionType) {
        filter.transactionType = formValue.transactionType as ITransactionType;
      }

      if (formValue.startDate) {
        filter.startDate = new Date(formValue.startDate).toISOString();
      }

      if (formValue.endDate) {
        filter.endDate = new Date(formValue.endDate).toISOString();
      }

      if (formValue.search) {
        filter.search = formValue.search;
      }

      // Build pagination object
      const pagination: IContributionPaginationInput = {
        first: this.pageSize(),
      };

      if (this.currentCursor()) {
        pagination.after = this.currentCursor() || undefined;
      }

      const result = await this.contributionService.getTransactions({
        filter,
        pagination,
      });

      if (result) {
        this.transactions.set(result.edges.map(edge => edge.node));
        this.totalCount.set(result.totalCount);

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
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Apply filters and reload transactions
   */
  applyFilters() {
    this.currentCursor.set(null); // Reset to first page
    this.loadTransactions();
  }

  /**
   * Reset filters to default values
   */
  resetFilters() {
    this.filterForm.reset({
      status: '',
      transactionType: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    this.currentCursor.set(null);
    this.loadTransactions();
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
        this.currentCursor.set(event.endCursor || null);
        this.paginationDirection.set('forward');
        break;
      case 'previous':
        this.currentCursor.set(event.startCursor || null);
        this.paginationDirection.set('backward');
        break;
      case 'first':
        this.currentCursor.set(null);
        this.paginationDirection.set('forward');
        break;
      case 'last':
        // For last page, we'd need to implement reverse pagination
        // For now, just stay on current page
        break;
    }

    this.loadTransactions();
  }

  /**
   * View transaction details (toggle expanded state for failed transactions)
   */
  viewTransactionDetails(transaction: TransactionNode) {
    if (transaction.status === ITransactionStatus.Failed) {
      // Toggle expanded state for failed transactions
      if (this.expandedTransactionId() === transaction.id) {
        this.expandedTransactionId.set(null);
      } else {
        this.expandedTransactionId.set(transaction.id);
      }
    } else {
      // Navigate to contribution detail page for successful transactions
      this.router.navigate(['/dashboard/contributions', transaction.contribution.id]);
    }
  }
}
