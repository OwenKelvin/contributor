import { Component, inject, OnInit, signal, input } from '@angular/core';
import { ContributionService } from '@nyots/data-source/contributions';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmButton } from '@nyots/ui/button';
import { HlmBadge } from '@nyots/ui/badge';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Field, FieldTree, form, submit } from '@angular/forms/signals';
import { IPaymentDetailsInput } from '@nyots/data-source';

interface PaymentData {
  phoneNumber: string;
  accountReference: string;
}

@Component({
  selector: 'nyots-contribution-detail',
  imports: [
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
    HlmButton,
    HlmBadge,
    HlmInput,
    HlmLabel,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    Field,
  ],
  template: `
    <div class="p-6 space-y-6 max-w-4xl mx-auto">
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <hlm-spinner />
        </div>
      } @else if (contribution()) {
        <div class="space-y-6">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-3xl font-bold mb-2">Contribution Details</h1>
              <p class="text-muted-foreground">
                Contribution ID: {{ contribution()?.id }}
              </p>
            </div>
            <span hlmBadge [variant]="getStatusVariant(contribution()?.paymentStatus || '')">
              {{ contribution()?.paymentStatus }}
            </span>
          </div>

          <!-- Contribution Information Card -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Contribution Information</h3>
            </div>
            <div hlmCardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-sm text-muted-foreground">Project</p>
                  <p class="font-medium text-lg">{{ contribution()?.project?.title }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Amount</p>
                  <p class="font-medium text-lg">{{ contribution()?.amount | currency }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Created Date</p>
                  <p class="font-medium">{{ contribution()?.createdAt | date: 'medium' }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Status</p>
                  <p class="font-medium">{{ contribution()?.paymentStatus }}</p>
                </div>
                @if (contribution()?.paidAt) {
                  <div>
                    <p class="text-sm text-muted-foreground">Paid Date</p>
                    <p class="font-medium">{{ contribution()?.paidAt | date: 'medium' }}</p>
                  </div>
                }
                @if (contribution()?.paymentReference) {
                  <div>
                    <p class="text-sm text-muted-foreground">Payment Reference</p>
                    <p class="font-medium">{{ contribution()?.paymentReference }}</p>
                  </div>
                }
              </div>
              @if (contribution()?.notes) {
                <div class="mt-6 pt-6 border-t">
                  <p class="text-sm text-muted-foreground mb-2">Notes</p>
                  <p class="text-muted-foreground">{{ contribution()?.notes }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Payment Section (only for PENDING status) -->
          @if (contribution()?.paymentStatus === 'PENDING') {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Complete Payment</h3>
              </div>
              <div hlmCardContent>
                <p class="text-muted-foreground mb-6">
                  Please provide your payment details to complete this contribution.
                </p>

                <form (submit)="onPaymentSubmit($event)" class="space-y-6">
                  <!-- Phone Number Field -->
                  <div class="space-y-2">
                    <label hlmLabel for="phoneNumber">Phone Number *</label>
                    <input
                      hlmInput
                      id="phoneNumber"
                      type="tel"
                      [field]="paymentForm.phoneNumber"
                      placeholder="e.g., 254712345678"
                      class="w-full"
                    />
                    <p class="text-sm text-muted-foreground">
                      Enter your M-Pesa phone number (format: 254XXXXXXXXX)
                    </p>
                  </div>

                  <!-- Account Reference Field -->
                  <div class="space-y-2">
                    <label hlmLabel for="accountReference">Account Reference *</label>
                    <input
                      hlmInput
                      id="accountReference"
                      type="text"
                      [field]="paymentForm.accountReference"
                      placeholder="e.g., Your Name or Account Number"
                      class="w-full"
                    />
                    <p class="text-sm text-muted-foreground">
                      This will appear on your M-Pesa statement
                    </p>
                  </div>

                  @if (paymentError()) {
                    <div class="p-4 bg-destructive/10 text-destructive rounded-md">
                      <p class="font-medium">Payment Failed</p>
                      <p class="text-sm mt-1">{{ paymentError() }}</p>
                    </div>
                  }

                  @if (paymentSuccess()) {
                    <div class="p-4 bg-green-50 text-green-700 rounded-md">
                      <p class="font-medium">Payment Initiated Successfully!</p>
                      <p class="text-sm mt-1">
                        Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
                      </p>
                    </div>
                  }

                  <div class="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      hlmBtn
                      class="flex-1"
                      [disabled]="processingPayment()"
                    >
                      @if (processingPayment()) {
                        <span>Processing Payment...</span>
                      } @else {
                        <span>Pay Now</span>
                      }
                    </button>
                    <button
                      type="button"
                      hlmBtn
                      variant="outline"
                      routerLink="/dashboard/my-contributions"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          }

          <!-- Failure Reason (if payment failed) -->
          @if (contribution()?.paymentStatus === 'FAILED' && contribution()?.failureReason) {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle class="text-destructive">Payment Failed</h3>
              </div>
              <div hlmCardContent>
                <p class="text-muted-foreground">{{ contribution()?.failureReason }}</p>
                <div class="mt-4">
                  <button hlmBtn (click)="retryPayment()">
                    Retry Payment
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Transactions (if any) -->
          @if (contribution()?.transactions?.length) {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Transaction History</h3>
              </div>
              <div hlmCardContent>
                <div class="space-y-4">
                  @for (transaction of contribution()?.transactions; track transaction.id) {
                    <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div class="flex-1">
                        <p class="font-medium">{{ transaction.transactionType }}</p>
                        <p class="text-sm text-muted-foreground">
                          {{ transaction.createdAt | date: 'medium' }}
                        </p>
                        @if (transaction.gatewayTransactionId) {
                          <p class="text-xs text-muted-foreground">
                            Gateway ID: {{ transaction.gatewayTransactionId }}
                          </p>
                        }
                      </div>
                      <div class="text-right">
                        <p class="font-semibold">{{ transaction.amount | currency }}</p>
                        <span hlmBadge [variant]="getTransactionStatusVariant(transaction.status)">
                          {{ transaction.status }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button hlmBtn variant="outline" routerLink="/dashboard/my-contributions">
              Back to My Contributions
            </button>
            <button hlmBtn variant="outline" [routerLink]="['/dashboard/projects', contribution()?.project?.id]">
              View Project
            </button>
          </div>
        </div>
      } @else {
        <div hlmCard class="text-center py-12">
          <div hlmCardContent>
            <p class="text-muted-foreground mb-4">Contribution not found.</p>
            <button hlmBtn routerLink="/dashboard/my-contributions">
              Back to My Contributions
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ContributionDetailComponent implements OnInit {
  private contributionService = inject(ContributionService);
  
  id = input.required<string>();
  
  loading = signal(true);
  processingPayment = signal(false);
  paymentError = signal<string | null>(null);
  paymentSuccess = signal(false);
  
  contribution = signal<{
    id: string;
    amount: number;
    paymentStatus: string;
    notes?: string | null;
    paymentReference?: string | null;
    failureReason?: string | null;
    paidAt?: string | null;
    createdAt: string;
    project?: {
      id: string;
      title: string;
    } | null;
    transactions?: Array<{
      id: string;
      transactionType: string;
      amount: number;
      status: string;
      gatewayTransactionId?: string | null;
      createdAt: string;
    }>;
  } | null>(null);

  // Payment Form Model
  paymentModel = signal<PaymentData>({
    phoneNumber: '',
    accountReference: '',
  });

  // Payment form field tree
  paymentForm = form(this.paymentModel);

  async ngOnInit() {
    await this.loadContribution();
  }

  async loadContribution() {
    this.loading.set(true);
    try {
      const result = await this.contributionService.getContribution(this.id());
      if (result) {
        this.contribution.set(result);
      }
    } catch (error) {
      console.error('Error loading contribution:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async processPayment(paymentFormData: FieldTree<PaymentData>) {
    this.paymentError.set(null);
    this.paymentSuccess.set(false);

    try {
      const phoneNumber = paymentFormData.phoneNumber().value().trim();
      const accountReference = paymentFormData.accountReference().value().trim();

      if (!phoneNumber || !accountReference) {
        this.paymentError.set('Please fill in all required fields');
        return null;
      }

      // Validate phone number format (basic validation)
      if (!/^254\d{9}$/.test(phoneNumber)) {
        this.paymentError.set('Phone number must be in format 254XXXXXXXXX');
        return null;
      }

      const paymentDetails: IPaymentDetailsInput = {
        phoneNumber,
        accountReference,
        transactionDesc: `Contribution to ${this.contribution()?.project?.title}`,
      };

      await this.contributionService.processPayment(
        this.id(),
        paymentDetails
      );

      this.paymentSuccess.set(true);
      
      // Reload contribution to get updated status
      setTimeout(() => {
        this.loadContribution();
      }, 2000);

      return null;
    } catch (error: unknown) {
      const err = error as { message?: string; error?: { message?: string } };
      const errorMsg = err?.message || 
        err?.error?.message || 
        'Failed to process payment. Please try again.';
      this.paymentError.set(errorMsg);
      return null;
    }
  }

  async onPaymentSubmit(e: Event) {
    e.preventDefault();
    this.processingPayment.set(true);
    await submit(this.paymentForm, async (fieldTree) =>
      this.processPayment(fieldTree as FieldTree<PaymentData>),
    );
    this.processingPayment.set(false);
  }

  retryPayment() {
    // Reset form and scroll to payment section
    this.paymentModel.set({
      phoneNumber: '',
      accountReference: '',
    });
    this.paymentError.set(null);
    this.paymentSuccess.set(false);
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'PAID': 'default',
      'PENDING': 'secondary',
      'FAILED': 'destructive',
      'REFUNDED': 'outline',
    };
    return variantMap[status] || 'outline';
  }

  getTransactionStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'COMPLETED': 'default',
      'PENDING': 'secondary',
      'FAILED': 'destructive',
      'REVERSED': 'outline',
    };
    return variantMap[status] || 'outline';
  }
}
