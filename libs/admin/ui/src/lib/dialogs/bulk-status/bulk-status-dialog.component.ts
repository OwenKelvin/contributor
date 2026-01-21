import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HlmButton } from '@nyots/ui/button';
import { HlmDialogDescription, HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@nyots/ui/dialog';
import { HlmLabel } from '@nyots/ui/label';
import { HlmTextarea } from '@nyots/ui/textarea';
import { ContributionStatus } from '../status-update/status-update-dialog.component';
import { HlmSelect, HlmSelectContent, HlmSelectOption, HlmSelectTrigger, HlmSelectValue } from '@nyots/ui/select';
import { TitleCasePipe } from '@angular/common'; // Reusing type

export interface BulkStatusDialogData {
  contributionIds: string[];
  currentStatus: ContributionStatus; // Assuming all selected have the same current status or we're showing a common one
}

@Component({
  selector: 'nyots-bulk-status-dialog',
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
  templateUrl: './bulk-status-dialog.component.html',
  styleUrl: './bulk-status-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkStatusDialog {
  private readonly _dialogRef = inject(DialogRef<boolean>);
  protected readonly _data = inject<BulkStatusDialogData>(DIALOG_DATA);

  readonly availableStatuses: ContributionStatus[] = [
    'pending',
    'approved',
    'rejected',
    'completed',
  ];

  bulkStatusForm = new FormGroup({
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
    if (this.bulkStatusForm.valid) {
      // In a real application, you would call a service here
      console.log(
        'Updating status for contributions:',
        this._data.contributionIds,
      );
      console.log('New status:', this.bulkStatusForm.value.newStatus);
      console.log('Notes:', this.bulkStatusForm.value.notes);
      this._dialogRef.close(true); // Close with true on success
    } else {
      this.bulkStatusForm.markAllAsTouched();
    }
  }
}
