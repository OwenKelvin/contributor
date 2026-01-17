import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { IPaymentStatus } from '@nyots/data-source';
import { ContributionService, IGetContributionQuery } from '@nyots/data-source/contributions';
import { PaymentStatusBadgeComponent, TransactionHistoryComponent } from '../../components';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';
import { HlmButton } from '@nyots/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideArrowLeft,
  lucideCalendar,
  lucideCheckCircle,
  lucideCreditCard,
  lucideDollarSign,
  lucideEdit,
  lucideFileText,
  lucideFolder,
  lucideRefreshCw,
  lucideUser
} from '@ng-icons/lucide';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmSeparator } from '@nyots/ui/separator';
import { BadgeVariants, HlmBadge } from '@nyots/ui/badge';

/**
 * Component for displaying detailed information about a single contribution.
 * Shows contributor info, project info, contribution details, and transaction history.
 * Provides actions for processing payments, refunds, and updating status.
 */
@Component({
  selector: 'nyots-contribution-detail',
  standalone: true,
  imports: [
    CommonModule,
    PaymentStatusBadgeComponent,
    TransactionHistoryComponent,
    HlmButton,
    NgIcon,
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmSeparator,
    HlmBadge,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCreditCard,
      lucideRefreshCw,
      lucideEdit,
      lucideUser,
      lucideFolder,
      lucideCalendar,
      lucideDollarSign,
      lucideFileText,
      lucideAlertCircle,
      lucideCheckCircle,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            hlmBtn
            variant="ghost"
            size="sm"
            (click)="goBack()"
            [attr.aria-label]="'Go back'"
          >
            <ng-icon name="lucideArrowLeft" size="16" class="mr-2" />
            Back
          </button>
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Contribution Details</h2>
            @if (contribution()) {
              <p class="text-muted-foreground">
                ID: {{ contribution()!.id }}
              </p>
            }
          </div>
        </div>

        <!-- Action Buttons -->
        @if (contribution()) {
          <div class="flex items-center gap-2">
            @if (contribution()!.paymentStatus === IPaymentStatus.Pending) {
              <button
                hlmBtn
                variant="default"
                (click)="processPayment()"
                [disabled]="isProcessing()"
              >
                <ng-icon name="lucideCreditCard" size="16" class="mr-2" />
                Process Payment
              </button>
            }

            @if (contribution()!.paymentStatus === IPaymentStatus.Paid) {
              <button
                hlmBtn
                variant="destructive"
                (click)="processRefund()"
                [disabled]="isProcessing()"
              >
                <ng-icon name="lucideRefreshCw" size="16" class="mr-2" />
                Process Refund
              </button>
            }

            <button
              hlmBtn
              variant="outline"
              (click)="updateStatus()"
              [disabled]="isProcessing()"
            >
              <ng-icon name="lucideEdit" size="16" class="mr-2" />
              Update Status
            </button>
          </div>
        }
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-2">
            <ng-icon
              name="lucideRefreshCw"
              size="32"
              class="animate-spin text-muted-foreground"
            />
            <p class="text-sm text-muted-foreground">Loading contribution details...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div hlmCard class="p-6">
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <ng-icon
              name="lucideAlertCircle"
              size="48"
              class="text-destructive mb-3"
            />
            <p class="text-lg font-medium">Failed to load contribution</p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ error() }}
            </p>
            <button hlmBtn variant="outline" class="mt-4" (click)="loadContribution()">
              Try Again
            </button>
          </div>
        </div>
      }

      <!-- Content -->
      @if (contribution() && !isLoading()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content (Left Column - 2/3) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Contribution Overview -->
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Contribution Overview</h3>
              </div>
              <div hlmCardContent>
                <div class="grid grid-cols-2 gap-6">
                  <!-- Amount -->
                  <div>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <ng-icon name="lucideDollarSign" size="16" />
                      <span>Amount</span>
                    </div>
                    <p class="text-2xl font-bold">
                      {{ contribution()!.amount | currency }}
                    </p>
                  </div>

                  <!-- Status -->
                  <div>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <ng-icon name="lucideCheckCircle" size="16" />
                      <span>Status</span>
                    </div>
                    <nyots-payment-status-badge [status]="contribution()!.paymentStatus" />
                  </div>

                  <!-- Created Date -->
                  <div>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <ng-icon name="lucideCalendar" size="16" />
                      <span>Created</span>
                    </div>
                    <p class="font-medium">
                      {{ contribution()!.createdAt | date: 'medium' }}
                    </p>
                  </div>

                  <!-- Paid Date -->
                  @if (contribution()!.paidAt) {
                    <div>
                      <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <ng-icon name="lucideCalendar" size="16" />
                        <span>Paid</span>
                      </div>
                      <p class="font-medium">
                        {{ contribution()!.paidAt | date: 'medium' }}
                      </p>
                    </div>
                  }
                </div>

                <!-- Payment Reference -->
                @if (contribution()!.paymentReference) {
                  <div hlmSeparator class="my-4"></div>
                  <div>
                    <p class="text-sm text-muted-foreground mb-1">Payment Reference</p>
                    <p class="font-mono text-sm">{{ contribution()!.paymentReference }}</p>
                  </div>
                }

                <!-- Failure Reason -->
                @if (contribution()!.failureReason) {
                  <div hlmSeparator class="my-4"></div>
                  <div class="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div class="flex items-start gap-2">
                      <ng-icon
                        name="lucideAlertCircle"
                        size="16"
                        class="text-destructive mt-0.5"
                      />
                      <div>
                        <p class="text-sm font-medium text-destructive">Failure Reason</p>
                        <p class="text-sm text-destructive/90 mt-1">
                          {{ contribution()!.failureReason }}
                        </p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Notes -->
                @if (contribution()!.notes) {
                  <div hlmSeparator class="my-4"></div>
                  <div>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <ng-icon name="lucideFileText" size="16" />
                      <span>Notes</span>
                    </div>
                    <p class="text-sm whitespace-pre-wrap">{{ contribution()!.notes }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Transaction History -->
            @if (contribution()!.transactions && contribution()!.transactions.length > 0) {
              <nyots-transaction-history [transactions]="contribution()!.transactions" />
            }
          </div>

          <!-- Sidebar (Right Column - 1/3) -->
          <div class="space-y-6">
            <!-- Contributor Information -->
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle class="flex items-center gap-2">
                  <ng-icon name="lucideUser" size="20" />
                  Contributor
                </h3>
              </div>
              <div hlmCardContent>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-muted-foreground">Name</p>
                    <p class="font-medium">
                      {{ contribution()!.user.firstName }} {{ contribution()!.user.lastName }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Email</p>
                    <p class="font-medium">{{ contribution()!.user.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">User ID</p>
                    <p class="font-mono text-xs">{{ contribution()!.user.id }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Project Information -->
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle class="flex items-center gap-2">
                  <ng-icon name="lucideFolder" size="20" />
                  Project
                </h3>
              </div>
              <div hlmCardContent>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-muted-foreground">Title</p>
                    <p class="font-medium">{{ contribution()!.project.title }}</p>
                  </div>
                  @if (contribution()!.project.description) {
                    <div>
                      <p class="text-sm text-muted-foreground">Description</p>
                      <p class="text-sm line-clamp-3">{{ contribution()!.project.description }}</p>
                    </div>
                  }
                  <div>
                    <p class="text-sm text-muted-foreground">Goal Amount</p>
                    <p class="font-medium">{{ contribution()!.project.goalAmount | currency }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Current Amount</p>
                    <p class="font-medium">{{ contribution()!.project.currentAmount | currency }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Status</p>
                    <span hlmBadge [variant]="contributionStatusBadgeVariant()">
                      {{ contribution()!.project.status }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Project ID</p>
                    <p class="font-mono text-xs">{{ contribution()!.project.id }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class ContributionDetailComponent implements OnInit {
  private readonly contributionService = inject(ContributionService);
  private readonly confirmationService = inject(ConfirmationDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // State management
  contribution = signal<IGetContributionQuery['getContribution'] | null>(null);
  contributionStatusBadgeVariant = computed(() =>
    this.getProjectStatusVariant(this.contribution()?.project.status)
  )
  isLoading = signal(false);
  isProcessing = signal(false);
  error = signal<string | null>(null);

  // Computed properties
  contributionId = computed(() => this.route.snapshot.paramMap.get('id'));

  ngOnInit() {
    this.loadContribution();
  }

  /**
   * Load contribution details by ID
   */
  async loadContribution() {
    const id = this.contributionId();
    if (!id) {
      this.error.set('No contribution ID provided');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const contribution = await this.contributionService.getContribution(id);
      if (contribution) {
        this.contribution.set(contribution);
      } else {
        this.error.set('Contribution not found');
      }
    } catch (err) {
      console.error('Error loading contribution:', err);
      this.error.set('Failed to load contribution. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigate back to contributions list
   */
  goBack() {
    this.router.navigate(['/dashboard/contributions']);
  }

  /**
   * Process payment for pending contribution
   */
  async processPayment() {
    const contribution = this.contribution();
    if (!contribution) return;

    if (contribution.paymentStatus !== IPaymentStatus.Pending) {
      toast.error('Only pending contributions can be processed for payment');
      return;
    }

    // TODO: Implement payment processing dialog
    toast.info('Payment processing coming soon');
  }

  /**
   * Process refund for paid contribution
   */
  async processRefund() {
    const contribution = this.contribution();
    if (!contribution) return;

    if (contribution.paymentStatus !== IPaymentStatus.Paid) {
      toast.error('Only paid contributions can be refunded');
      return;
    }

    // Confirm with user using confirmation dialog
    const confirmed = await this.confirmationService.confirmDestructive({
      title: 'Process Refund',
      description: `Are you sure you want to process a refund for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(contribution.amount)}? This action will reverse the payment and update the project amount.`,
      confirmText: 'Process Refund',
      cancelText: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    this.isProcessing.set(true);

    try {
      const reason = 'Refund requested by admin'; // TODO: Get from form/dialog
      const updated = await this.contributionService.processRefund(
        contribution.id,
        reason
      );

      if (updated) {
        this.contribution.set(updated);
        toast.success('Refund processed successfully');
        // Reload to get updated transactions
        await this.loadContribution();
      }
    } catch (err) {
      console.error('Error processing refund:', err);
      toast.error('Failed to process refund. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Update contribution status
   */
  async updateStatus() {
    // TODO: Implement status update dialog
    toast.info('Status update functionality coming soon');
  }

  /**
   * Get badge variant for project status
   */
  getProjectStatusVariant(status?: string): BadgeVariants['variant'] {
    switch (status?.toUpperCase()) {
      case 'ACTIVE' :
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'ARCHIVED':
        return 'outline';
      default:
        return 'outline';
    }
  }

  protected readonly IPaymentStatus = IPaymentStatus;
}
