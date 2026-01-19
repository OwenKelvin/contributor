import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProject } from '@nyots/data-source';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmButton } from '@nyots/ui/button';
import { HlmCheckboxImports } from '@nyots/ui/checkbox';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEdit,
  lucideTrash2,
  lucideEye,
  lucideCalendar,
  lucideDollarSign,
} from '@ng-icons/lucide';

@Component({
  selector: 'nyots-project-card',
  standalone: true,
  imports: [
    CommonModule,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmButton,
    HlmCheckboxImports,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideEdit,
      lucideTrash2,
      lucideEye,
      lucideCalendar,
      lucideDollarSign,
    }),
  ],
  template: `
    <div hlmCard class="w-full">
      <div hlmCardHeader>
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h3 hlmCardTitle class="text-base truncate">{{ project().title }}</h3>
            <p hlmCardDescription class="text-xs mt-1">
              <span class="font-mono">{{ project().id.substring(0, 8) }}...</span>
            </p>
          </div>
          @if (showCheckbox()) {
            <hlm-checkbox
              [checked]="isSelected()"
              (changed)="onSelectionChange()"
              [attr.aria-label]="'Select project ' + project().title"
            />
          }
        </div>

        <!-- Status Badge -->
        <div class="mt-2">
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            [ngClass]="getStatusClass(project().status)"
          >
            {{ getStatusLabel(project().status) }}
          </span>
        </div>
      </div>

      <div hlmCardContent class="space-y-3">
        <!-- Goal Amount -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground flex items-center gap-1">
            <ng-icon hlmIcon name="lucideDollarSign" size="14" />
            Goal
          </span>
          <span class="font-medium">{{ formatCurrency(project().goalAmount) }}</span>
        </div>

        <!-- Current Amount -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground flex items-center gap-1">
            <ng-icon hlmIcon name="lucideDollarSign" size="14" />
            Current
          </span>
          <span class="font-medium">{{ formatCurrency(project().currentAmount) }}</span>
        </div>

        <!-- Created Date -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground flex items-center gap-1">
            <ng-icon hlmIcon name="lucideCalendar" size="14" />
            Created
          </span>
          <span>{{ formatDate(project().createdAt) }}</span>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-2 border-t">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            class="flex-1"
            (click)="onView()"
            [attr.aria-label]="'View project ' + project().title"
          >
            <ng-icon hlmIcon name="lucideEye" size="16" class="mr-2" />
            View
          </button>
          <button
            hlmBtn
            variant="outline"
            size="sm"
            class="flex-1"
            (click)="onEdit()"
            [attr.aria-label]="'Edit project ' + project().title"
          >
            <ng-icon hlmIcon name="lucideEdit" size="16" class="mr-2" />
            Edit
          </button>
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="onDelete()"
            [attr.aria-label]="'Delete project ' + project().title"
            class="text-destructive hover:text-destructive"
          >
            <ng-icon hlmIcon name="lucideTrash2" size="16" />
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ProjectCardComponent {
  // Inputs
  project = input.required<IProject>();
  showCheckbox = input<boolean>(false);
  isSelected = input<boolean>(false);

  // Outputs
  projectEdit = output<void>();
  projectDelete = output<void>();
  projectView = output<void>();
  selectionChange = output<void>();

  onEdit() {
    this.projectEdit.emit();
  }

  onDelete() {
    this.projectDelete.emit();
  }

  onView() {
    this.projectView.emit();
  }

  onSelectionChange() {
    this.selectionChange.emit();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      DRAFT: 'Draft',
      ACTIVE: 'Active',
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      ARCHIVED: 'Archived',
    };
    return statusLabels[status] || status;
  }
}
