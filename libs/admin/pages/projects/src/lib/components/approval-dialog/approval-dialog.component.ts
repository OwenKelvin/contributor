import { Component, inject, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@nyots/ui/button';
import { HlmLabel } from '@nyots/ui/label';
import { HlmInput } from '@nyots/ui/input';
import {
  HlmDialogHeader,
  HlmDialogTitle,
  HlmDialogDescription,
  HlmDialogFooter,
} from '@nyots/ui/dialog';

export interface ApprovalDialogContext {
  title: string;
  message: string;
  projectTitle: string;
}

@Component({
  selector: 'nyots-approval-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButton,
    HlmLabel,
    HlmInput,
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
    <div class="py-4 space-y-4">
      <div>
        <p class="text-sm font-medium">Project</p>
        <p class="text-sm text-muted-foreground mt-1">{{ context.projectTitle }}</p>
      </div>
      <div>
        <label hlmLabel for="notes">Approval Notes (Optional)</label>
        <textarea
          hlmInput
          id="notes"
          [(ngModel)]="notes"
          placeholder="Add any notes about this approval..."
          rows="4"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        ></textarea>
      </div>
    </div>
    <div hlmDialogFooter class="flex gap-2 justify-end">
      <button hlmBtn variant="outline" (click)="onCancel()">Cancel</button>
      <button hlmBtn variant="default" (click)="onConfirm()">
        Approve Project
      </button>
    </div>
  `,
})
export class ApprovalDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef);
  protected readonly context = injectBrnDialogContext<ApprovalDialogContext>();

  notes = signal<string>('');

  onConfirm() {
    this.dialogRef.close(this.notes() || undefined);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
