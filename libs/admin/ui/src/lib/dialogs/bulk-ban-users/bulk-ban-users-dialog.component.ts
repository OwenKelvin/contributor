import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HlmButton } from '@nyots/ui/button';
import { HlmDialogDescription, HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@nyots/ui/dialog';
import { HlmLabel } from '@nyots/ui/label';
import { HlmTextarea } from '@nyots/ui/textarea';
import { CommonModule } from '@angular/common';

export interface BulkBanUsersDialogData {
  userIds: string[];
}

@Component({
  selector: 'nyots-bulk-ban-users-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmButton,
    HlmLabel,
    HlmTextarea,
  ],
  templateUrl: './bulk-ban-users-dialog.component.html',
  styleUrl: './bulk-ban-users-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkBanUsersDialog {
  private readonly _dialogRef = inject(DialogRef<string | undefined>);
  protected readonly _data = inject<BulkBanUsersDialogData>(DIALOG_DATA);

  banReasonForm = new FormGroup({
    reason: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  onCancel(): void {
    this._dialogRef.close(undefined);
  }

  onConfirm(): void {
    if (this.banReasonForm.valid) {
      this._dialogRef.close(this.banReasonForm.value.reason || '');
    } else {
      this.banReasonForm.markAllAsTouched();
    }
  }

  get usersText(): string {
    if (this._data.userIds.length === 1) {
      return `user ${this._data.userIds[0]}`;
    }
    return `${this._data.userIds.length} users`;
  }
}
