import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HlmButton } from '@nyots/ui/button';
import { HlmDialogDescription, HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@nyots/ui/dialog';
import { HlmLabel } from '@nyots/ui/label';
import { HlmTextarea } from '@nyots/ui/textarea';

export interface RefundReasonDialogData {
  contributionId: string;
}

@Component({
  selector: 'nyots-refund-reason-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmButton,
    HlmLabel,
    HlmTextarea,
  ],
  templateUrl: './refund-reason-dialog.component.html',
  styleUrl: './refund-reason-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefundReasonDialog {
  private readonly _dialogRef = inject(DialogRef<boolean>);
  public readonly _data = inject<RefundReasonDialogData>(DIALOG_DATA);

  refundReasonForm = new FormGroup({
    reason: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  onCancel(): void {
    this._dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.refundReasonForm.valid) {
      // In a real application, you would call a service here
      console.log('Refunding contribution:', this._data.contributionId);
      console.log('Reason:', this.refundReasonForm.value.reason);
      this._dialogRef.close(true); // Close with true on success
    } else {
      this.refundReasonForm.markAllAsTouched();
    }
  }
}
