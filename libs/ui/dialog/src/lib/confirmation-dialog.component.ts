import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmDialogContent,
  HlmDialogHeader,
  HlmDialogFooter,
  HlmDialogTitle,
  HlmDialogDescription,
} from '@nyots/ui/dialog';
import { HlmButton } from '@nyots/ui/button';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'default' | 'destructive';
}

@Component({
  selector: 'hlm-confirmation-dialog',
  standalone: true,
  imports: [
    HlmDialogContent,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmButton,
  ],
  template: `
    <div hlmDialogHeader>
      <h3 hlmDialogTitle>{{ _data.title }}</h3>
    </div>
    <p hlmDialogDescription class="py-4">{{ _data.message }}</p>
    <div hlmDialogFooter>
      <button hlmBtn (click)="onCancel()" variant="outline">{{ _data.cancelLabel }}</button>
      <button hlmBtn (click)="onConfirm()" [variant]="_data.variant">{{ _data.confirmLabel }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  protected readonly _dialogRef = inject(DialogRef);
  protected readonly _data = inject(DIALOG_DATA);

  onConfirm() {
    this._dialogRef.close(true);
  }

  onCancel() {
    this._dialogRef.close(false);
  }
}
