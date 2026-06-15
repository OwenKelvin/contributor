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
      [IPaymentStatus.Pending]: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      [IPaymentStatus.Paid]: 'bg-emerald-100 dark:bg-emerald-900 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      [IPaymentStatus.Failed]: 'bg-destructive text-destructive border-destructive',
      [IPaymentStatus.Refunded]: 'bg-muted text-foreground border-border',
    };
    return statusMap[status] || 'bg-muted text-foreground border-border';
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
