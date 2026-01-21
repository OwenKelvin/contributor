import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HlmButton } from '@nyots/ui/button';
import { HlmDialogDescription, HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@nyots/ui/dialog';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';

export interface PaymentProcessingDialogData {
  contributionIds: string[];
}

@Component({
  selector: 'nyots-payment-processing-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmButton,
    HlmInput,
    HlmLabel,
  ],
  templateUrl: './payment-processing-dialog.component.html',
  styleUrl: './payment-processing-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentProcessingDialog {
  private readonly _dialogRef = inject(DialogRef<{ phoneNumber: string, accountReference: string } | undefined>);
  private readonly _data = inject<PaymentProcessingDialogData>(DIALOG_DATA);

  paymentForm = new FormGroup({
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]), // Basic phone number validation
    accountReference: new FormControl('', Validators.required),
  });

  onCancel(): void {
    this._dialogRef.close(undefined);
  }

  onConfirm(): void {
    if (this.paymentForm.valid) {
      this._dialogRef.close(this.paymentForm.value as { phoneNumber: string, accountReference: string });
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }

  get contributionsText(): string {
    if (this._data.contributionIds.length === 1) {
      return `contribution ${this._data.contributionIds[0]}`;
    }
    return `${this._data.contributionIds.length} contributions`;
  }
}
