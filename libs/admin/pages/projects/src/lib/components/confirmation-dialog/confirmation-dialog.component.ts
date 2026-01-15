import { Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@nyots/ui/button';
import {
  HlmDialogHeader,
  HlmDialogTitle,
  HlmDialogDescription,
  HlmDialogFooter,
} from '@nyots/ui/dialog';

export interface ConfirmationDialogContext {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

@Component({
  selector: 'nyots-confirmation-dialog',
  standalone: true,
  imports: [
    HlmButton,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmDialogFooter,
  ],
  template: `
    <div hlmDialogHeader>
      <h3 hlmDialogTitle>{{ context.title }}</h3>
      <p hlmDialogDescription>{{ context.message }}</p>
    </div>
    <div hlmDialogFooter class="flex gap-2 justify-end">
      <button hlmBtn variant="outline" (click)="onCancel()">
        {{ context.cancelLabel || 'Cancel' }}
      </button>
      <button
        hlmBtn
        [variant]="context.variant || 'default'"
        (click)="onConfirm()"
      >
        {{ context.confirmLabel || 'Confirm' }}
      </button>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef);
  protected readonly context = injectBrnDialogContext<ConfirmationDialogContext>();

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
