import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HlmButton } from '@nyots/ui/button';
import { HlmDialogDescription, HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@nyots/ui/dialog';
import { HlmLabel } from '@nyots/ui/label';
import { CommonModule } from '@angular/common';
import { HlmSelect, HlmSelectContent, HlmSelectOption, HlmSelectTrigger, HlmSelectValue } from '@nyots/ui/select';

// Assuming a Role interface exists in @nyots/data-source/user or similar
export interface IRole {
  id: string;
  name: string;
}

export interface BulkAssignRoleDialogData {
  userIds: string[];
  availableRoles: IRole[];
}

@Component({
  selector: 'nyots-bulk-assign-role-dialog',
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
    HlmSelect,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmSelectContent,
    HlmSelectOption,
  ],
  templateUrl: './bulk-assign-role-dialog.component.html',
  styleUrl: './bulk-assign-role-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkAssignRoleDialog {
  private readonly _dialogRef = inject(DialogRef<IRole | undefined>);
  protected readonly _data = inject<BulkAssignRoleDialogData>(DIALOG_DATA);

  assignRoleForm = new FormGroup({
    roleId: new FormControl<string | null>(null, Validators.required),
  });

  onCancel(): void {
    this._dialogRef.close(undefined);
  }

  onConfirm(): void {
    if (this.assignRoleForm.valid) {
      const selectedRoleId = this.assignRoleForm.value.roleId;
      const selectedRole = this._data.availableRoles.find(
        (r) => r.id === selectedRoleId,
      );
      this._dialogRef.close(selectedRole);
    } else {
      this.assignRoleForm.markAllAsTouched();
    }
  }

  get usersText(): string {
    if (this._data.userIds.length === 1) {
      return `user ${this._data.userIds[0]}`;
    }
    return `${this._data.userIds.length} users`;
  }
}
