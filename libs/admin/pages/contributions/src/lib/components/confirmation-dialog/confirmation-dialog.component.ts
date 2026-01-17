import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HlmAlertDialog,
  HlmAlertDialogContent,
  HlmAlertDialogHeader,
  HlmAlertDialogFooter,
  HlmAlertDialogTitle,
  HlmAlertDialogDescription, HlmAlertDialogCancel, HlmAlertDialogAction
} from '@nyots/ui/alert-dialog';
import { HlmButton } from '@nyots/ui/button';

/**
 * Reusable confirmation dialog component using Spartan UI Alert Dialog.
 * Provides a consistent confirmation experience across the application.
 */
@Component({
  selector: 'nyots-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    HlmAlertDialog,
    HlmAlertDialogContent,
    HlmAlertDialogHeader,
    HlmAlertDialogFooter,
    HlmAlertDialogTitle,
    HlmAlertDialogDescription,
    HlmAlertDialogCancel,
    HlmAlertDialogAction,
    HlmButton,
  ],
  template: `
    <hlm-alert-dialog>
      <hlm-alert-dialog-content>
        <hlm-alert-dialog-header>
          <h3 hlmAlertDialogTitle>{{ title }}</h3>
          <p hlmAlertDialogDescription>{{ description }}</p>
        </hlm-alert-dialog-header>
        <hlm-alert-dialog-footer>
          <button
            hlmBtn
            variant="outline"
            hlmAlertDialogCancel
            (click)="onCancel()"
          >
            {{ cancelText }}
          </button>
          <button
            hlmBtn
            [variant]="variant === 'destructive' ? 'destructive' : 'default'"
            hlmAlertDialogAction
            (click)="onConfirm()"
          >
            {{ confirmText }}
          </button>
        </hlm-alert-dialog-footer>
      </hlm-alert-dialog-content>
    </hlm-alert-dialog>
  `,
})
export class ConfirmationDialogComponent {
  @Input() title = 'Confirm Action';
  @Input() description = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'default' | 'destructive' = 'default';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
