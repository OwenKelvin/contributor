import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITransaction, ITransactionStatus, ITransactionType } from '@nyots/data-source';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmBadge } from '@nyots/ui/badge';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideXCircle,
  lucideClock,
  lucideArrowDownCircle,
  lucideArrowUpCircle,
  lucideAlertCircle,
} from '@ng-icons/lucide';

/**
 * Component for displaying transaction history for a contribution.
 * Shows all payment and refund transactions in chronological order.
 */
@Component({
  selector: 'nyots-transaction-history',
  standalone: true,
  imports: [
    CommonModule,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmBadge,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCheckCircle,
      lucideXCircle,
      lucideClock,
      lucideArrowDownCircle,
      lucideArrowUpCircle,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Transaction History</h3>
        <p hlmCardDescription>
          @if (transactions().length > 0) {
            {{ transactions().length }} transaction(s)
          } @else {
            No transactions recorded
          }
        </p>
      </div>
      <div hlmCardContent>
        @if (transactions().length === 0) {
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <ng-icon
              name="lucideAlertCircle"
              size="48"
              class="text-muted-foreground mb-3"
            />
            <p class="text-sm text-muted-foreground">
              No transactions have been recorded for this contribution yet.
            </p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (transaction of transactions(); track transaction.id) {
              <div class="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <!-- Transaction Icon -->
                <div class="flex-shrink-0">
                  @switch (transaction.transactionType) {
                    @case ('PAYMENT') {
                      <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <ng-icon
                          name="lucideArrowDownCircle"
                          size="20"
                          class="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                    }
                    @case ('REFUND') {
                      <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <ng-icon
                          name="lucideArrowUpCircle"
                          size="20"
                          class="text-orange-600 dark:text-orange-400"
                        />
                      </div>
                    }
                  }
                </div>

                <!-- Transaction Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 class="font-medium">
                        {{ getTransactionTypeLabel(transaction.transactionType) }}
                      </h4>
                      <p class="text-sm text-muted-foreground">
                        {{ transaction.createdAt | date: 'medium' }}
                      </p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                      <span class="text-lg font-semibold">
                        {{ transaction.amount | currency }}
                      </span>
                      <span hlmBadge [variant]="getStatusVariant(transaction.status)">
                        {{ getStatusLabel(transaction.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Gateway Transaction ID -->
                  @if (transaction.gatewayTransactionId) {
                    <div class="text-sm mb-2">
                      <span class="text-muted-foreground">Transaction ID:</span>
                      <span class="ml-2 font-mono">{{ transaction.gatewayTransactionId }}</span>
                    </div>
                  }

                  <!-- Gateway Response -->
                  @if (transaction.gatewayResponse) {
                    <div class="text-sm mb-2">
                      <span class="text-muted-foreground">Gateway Response:</span>
                      <span class="ml-2">{{ transaction.gatewayResponse }}</span>
                    </div>
                  }

                  <!-- Error Details (for failed transactions) -->
                  @if (transaction.status === 'FAILED' && (transaction.errorCode || transaction.errorMessage)) {
                    <div class="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div class="flex items-start gap-2">
                        <ng-icon
                          name="lucideXCircle"
                          size="16"
                          class="text-destructive mt-0.5"
                        />
                        <div class="flex-1 min-w-0">
                          @if (transaction.errorCode) {
                            <p class="text-sm font-medium text-destructive">
                              Error Code: {{ transaction.errorCode }}
                            </p>
                          }
                          @if (transaction.errorMessage) {
                            <p class="text-sm text-destructive/90 mt-1">
                              {{ transaction.errorMessage }}
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class TransactionHistoryComponent {
  /**
   * Array of transactions to display, sorted in chronological order
   */
  transactions = input.required<ITransaction[]>();

  /**
   * Get human-readable label for transaction type
   */
  getTransactionTypeLabel(type: ITransactionType): string {
    switch (type) {
      case 'PAYMENT':
        return 'Payment';
      case 'REFUND':
        return 'Refund';
      default:
        return type;
    }
  }

  /**
   * Get human-readable label for transaction status
   */
  getStatusLabel(status: ITransactionStatus): string {
    switch (status) {
      case 'SUCCESS':
        return 'Success';
      case 'FAILED':
        return 'Failed';
      case 'PENDING':
        return 'Pending';
      default:
        return status;
    }
  }

  /**
   * Get badge variant for transaction status
   */
  getStatusVariant(status: ITransactionStatus): string {
    switch (status) {
      case 'SUCCESS':
        return 'default'; // Green
      case 'FAILED':
        return 'destructive'; // Red
      case 'PENDING':
        return 'secondary'; // Yellow/Gray
      default:
        return 'outline';
    }
  }
}
