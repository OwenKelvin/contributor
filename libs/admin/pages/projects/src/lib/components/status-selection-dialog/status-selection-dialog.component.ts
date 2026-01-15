import { Component, inject, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@nyots/ui/button';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmDialogHeader,
  HlmDialogTitle,
  HlmDialogDescription,
  HlmDialogFooter,
} from '@nyots/ui/dialog';
import { IProjectStatus } from '@nyots/data-source';

export interface StatusSelectionDialogContext {
  title: string;
  message: string;
  currentStatus?: IProjectStatus;
}

@Component({
  selector: 'nyots-status-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButton,
    HlmLabel,
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
    <div class="py-4">
      <label hlmLabel for="status">Select New Status</label>
      <select
        id="status"
        [(ngModel)]="selectedStatus"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">-- Select Status --</option>
        <option
          *ngFor="let status of availableStatuses"
          [value]="status.value"
        >
          {{ status.label }}
        </option>
      </select>
    </div>
    <div hlmDialogFooter class="flex gap-2 justify-end">
      <button hlmBtn variant="outline" (click)="onCancel()">Cancel</button>
      <button
        hlmBtn
        variant="default"
        [disabled]="!selectedStatus()"
        (click)="onConfirm()"
      >
        Update Status
      </button>
    </div>
  `,
})
export class StatusSelectionDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef);
  protected readonly context = injectBrnDialogContext<StatusSelectionDialogContext>();

  selectedStatus = signal<IProjectStatus | ''>('');

  availableStatuses = [
    { value: IProjectStatus.Draft, label: 'Draft' },
    { value: IProjectStatus.Active, label: 'Active' },
    { value: IProjectStatus.Pending, label: 'Pending' },
    { value: IProjectStatus.Completed, label: 'Completed' },
    { value: IProjectStatus.Archived, label: 'Archived' },
  ];

  onConfirm() {
    const status = this.selectedStatus();
    if (status) {
      this.dialogRef.close(status);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
