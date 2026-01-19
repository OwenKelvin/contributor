import { Component, inject, signal, computed } from '@angular/core';
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

export interface RejectionDialogContext {
  title: string;
  message: string;
  projectTitle: string;
}

@Component({
  selector: 'nyots-rejection-dialog',
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
        <label hlmLabel for="reason">Rejection Reason <span class="text-destructive">*</span></label>
        <textarea
          hlmInput
          id="reason"
          [(ngModel)]="reason"
          placeholder="Please provide a reason for rejecting this project..."
          rows="4"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          [class.border-destructive]="showError()"
        ></textarea>
        @if (showError()) {
          <p class="text-sm text-destructive mt-1">Rejection reason is required</p>
        }
      </div>
    </div>
    <div hlmDialogFooter class="flex gap-2 justify-end">
      <button hlmBtn variant="outline" (click)="onCancel()">Cancel</button>
      <button
        hlmBtn
        variant="destructive"
        [disabled]="!isValid()"
        (click)="onConfirm()"
      >
        Reject Project
      </button>
    </div>
  `,
})
export class RejectionDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef);
  protected readonly context = injectBrnDialogContext<RejectionDialogContext>();

  reason = signal<string>('');
  showError = signal<boolean>(false);

  // Computed signal to check if reason is valid (non-empty after trimming)
  isValid = computed(() => {
    const trimmedReason = this.reason().trim();
    return trimmedReason.length > 0;
  });

  onConfirm() {
    const trimmedReason = this.reason().trim();
    if (trimmedReason.length === 0) {
      this.showError.set(true);
      return;
    }
    this.dialogRef.close(trimmedReason);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
