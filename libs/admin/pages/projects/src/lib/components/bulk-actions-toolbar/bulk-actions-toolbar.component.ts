import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTrash2,
  lucideEdit3,
  lucideX,
} from '@ng-icons/lucide';

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

@Component({
  selector: 'nyots-bulk-actions-toolbar',
  standalone: true,
  imports: [CommonModule, HlmButton, HlmIcon, NgIcon],
  providers: [
    provideIcons({
      lucideTrash2,
      lucideEdit3,
      lucideX,
    }),
  ],
  templateUrl: './bulk-actions-toolbar.component.html',
  styleUrls: ['./bulk-actions-toolbar.component.scss'],
})
export class BulkActionsToolbarComponent {
  // Inputs using new signal-based API
  selectedCount = input<number>(0);
  availableActions = input<BulkAction[]>([
    {
      id: 'delete',
      label: 'Delete',
      icon: 'lucideTrash2',
      variant: 'destructive',
    },
    {
      id: 'changeStatus',
      label: 'Change Status',
      icon: 'lucideEdit3',
      variant: 'outline',
    },
  ]);

  // Outputs using new signal-based API
  actionSelected = output<string>();
  clearSelection = output<void>();

  onActionClick(actionId: string) {
    this.actionSelected.emit(actionId);
  }

  onClearSelection() {
    this.clearSelection.emit();
  }
}
