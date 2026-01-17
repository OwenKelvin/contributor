import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmPopover,
  HlmPopoverContent,
  HlmPopoverTrigger
} from '@nyots/ui/popover';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideX } from '@ng-icons/lucide';
import { HlmIcon } from '@nyots/ui/icon';
import { BrnPopoverContent } from '@spartan-ng/brain/popover';

@Component({
  selector: 'nyots-date-range-filter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButton,
    HlmInput,
    HlmLabel,
    NgIcon,
    HlmIcon,
    HlmPopover,
    HlmPopoverTrigger,
    HlmPopoverContent,
    BrnPopoverContent,
  ],
  template: `
    <hlm-popover>
      <button hlmBtn variant="outline" hlmPopoverTrigger>
        <ng-icon name="lucideCalendar" hlm size="sm" class="mr-2" />
        @if (hasDateRange()) {
          {{ formatDateRange() }}
        } @else {
          Select Date Range
        }
      </button>
      <div hlmPopoverContent *brnPopoverContent="let ctx" class="w-80">
        <div class="space-y-4">
          <h4 class="font-medium text-sm">Filter by Date Range</h4>

          <div class="space-y-2">
            <label hlmLabel for="startDate">Start Date</label>
            <input
              hlmInput
              type="date"
              id="startDate"
              [formControl]="startDateControl"
            />
          </div>

          <div class="space-y-2">
            <label hlmLabel for="endDate">End Date</label>
            <input
              hlmInput
              type="date"
              id="endDate"
              [formControl]="endDateControl"
            />
          </div>

          <div class="flex gap-2">
            <button hlmBtn size="sm" class="flex-1" (click)="applyFilter()">
              Apply
            </button>
            <button hlmBtn size="sm" variant="outline" (click)="clearFilter()">
              <ng-icon name="lucideX" hlm size="sm" />
            </button>
          </div>

          <div class="border-t pt-2">
            <p class="text-xs text-muted-foreground mb-2">Quick Filters:</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="setLast7Days()"
              >
                Last 7 Days
              </button>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="setLast30Days()"
              >
                Last 30 Days
              </button>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="setThisMonth()"
              >
                This Month
              </button>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="setLastMonth()"
              >
                Last Month
              </button>
            </div>
          </div>
        </div>
      </div>
    </hlm-popover>
  `,
  providers: [
    provideIcons({
      lucideCalendar,
      lucideX,
    }),
  ],
})
export class DateRangeFilterComponent {
  @Output() dateRangeChange = new EventEmitter<{
    startDate?: Date;
    endDate?: Date;
  }>();

  startDateControl = new FormControl<string>('');
  endDateControl = new FormControl<string>('');

  hasDateRange(): boolean {
    return !!(this.startDateControl.value || this.endDateControl.value);
  }

  formatDateRange(): string {
    const start = this.startDateControl.value;
    const end = this.endDateControl.value;

    if (start && end) {
      return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    } else if (start) {
      return `From ${this.formatDate(start)}`;
    } else if (end) {
      return `Until ${this.formatDate(end)}`;
    }
    return '';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  applyFilter() {
    const startDate = this.startDateControl.value
      ? new Date(this.startDateControl.value)
      : undefined;
    const endDate = this.endDateControl.value
      ? new Date(this.endDateControl.value)
      : undefined;

    this.dateRangeChange.emit({ startDate, endDate });
  }

  clearFilter() {
    this.startDateControl.setValue('');
    this.endDateControl.setValue('');
    this.dateRangeChange.emit({});
  }

  setLast7Days() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    this.setDateRange(start, end);
  }

  setLast30Days() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    this.setDateRange(start, end);
  }

  setThisMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();
    this.setDateRange(start, end);
  }

  setLastMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    this.setDateRange(start, end);
  }

  private setDateRange(start: Date, end: Date) {
    this.startDateControl.setValue(start.toISOString().split('T')[0]);
    this.endDateControl.setValue(end.toISOString().split('T')[0]);
    this.applyFilter();
  }
}
