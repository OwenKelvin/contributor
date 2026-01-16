import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmBadge } from '@nyots/ui/badge';
import { IPaymentStatus } from '@nyots/data-source';


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
  status = input.required<IPaymentStatus>();

  getStatusClass(status: IPaymentStatus): string {
    const statusMap: Record<IPaymentStatus, string> = {
      [IPaymentStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [IPaymentStatus.Paid]: 'bg-green-100 text-green-800 border-green-200',
      [IPaymentStatus.Failed]: 'bg-red-100 text-red-800 border-red-200',
      [IPaymentStatus.Refunded]: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getStatusLabel(status: IPaymentStatus): string {
    const statusLabels: Record<IPaymentStatus, string> = {
      [IPaymentStatus.Pending]: 'Pending',
      [IPaymentStatus.Paid]: 'Paid',
      [IPaymentStatus.Failed]: 'Failed',
      [IPaymentStatus.Refunded]: 'Refunded',
    };
    return statusLabels[status] || status;
  }
}
