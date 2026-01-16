import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmBadge } from '@nyots/ui/badge';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

@Component({
  selector: 'nyots-payment-status-badge',
  standalone: true,
  imports: [CommonModule, HlmBadge],
  template: `
    <span
      hlmBadge
      [class]="getStatusClass(status())"
      [attr.aria-label]="'Payment status: ' + getStatusLabel(status())"
    >
      {{ getStatusLabel(status()) }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
})
export class PaymentStatusBadgeComponent {
  // Input
  status = input.required<PaymentStatus>();

  getStatusClass(status: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getStatusLabel(status: PaymentStatus): string {
    const statusLabels: Record<PaymentStatus, string> = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded',
    };
    return statusLabels[status] || status;
  }
}
