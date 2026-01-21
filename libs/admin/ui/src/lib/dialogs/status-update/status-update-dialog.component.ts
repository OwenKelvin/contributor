import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HlmButton } from '@nyots/ui/button';
import { HlmDialogDescription, HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@nyots/ui/dialog';
import { HlmLabel } from '@nyots/ui/label';
import { HlmTextarea } from '@nyots/ui/textarea';
import { HlmInput } from '@nyots/ui/input';
import { HlmSelect, HlmSelectContent, HlmSelectOption, HlmSelectTrigger, HlmSelectValue } from '@nyots/ui/select';
import { TitleCasePipe } from '@angular/common';

export type ContributionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface StatusUpdateDialogData {
  contributionId: string;
  currentStatus: ContributionStatus;
}

@Component({
  selector: 'nyots-status-update-dialog',
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
    HlmSelect,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmSelectContent,
    HlmSelectOption,
    TitleCasePipe,
  ],
  templateUrl: './status-update-dialog.component.html',
  styleUrl: './status-update-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusUpdateDialog {
  private readonly _dialogRef = inject(DialogRef<boolean>);
  public readonly _data = inject<StatusUpdateDialogData>(DIALOG_DATA);

  readonly availableStatuses: ContributionStatus[] = [
    'pending',
    'approved',
    'rejected',
    'completed',
  ];

  statusUpdateForm = new FormGroup({
    newStatus: new FormControl<ContributionStatus>(
      this._data.currentStatus,
      Validators.required,
    ),
    notes: new FormControl(''),
  });

  onCancel(): void {
    this._dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.statusUpdateForm.valid) {
      // In a real application, you would call a service here
      console.log(
        'Updating status for contribution:',
        this._data.contributionId,
      );
      console.log('New status:', this.statusUpdateForm.value.newStatus);
      console.log('Notes:', this.statusUpdateForm.value.notes);
      this._dialogRef.close(true); // Close with true on success
    } else {
      this.statusUpdateForm.markAllAsTouched();
    }
  }
}
