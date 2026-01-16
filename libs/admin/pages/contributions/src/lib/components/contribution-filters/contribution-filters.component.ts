import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmInput } from '@nyots/ui/input';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX, lucideFilter } from '@ng-icons/lucide';
import { IContributionFilter, IPaymentStatus, IProject } from '@nyots/data-source';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'nyots-contribution-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInput,
    HlmButton,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideX,
      lucideFilter,
    }),
  ],
  template: `
    <div class="space-y-4">
      <form [formGroup]="filterForm" class="space-y-4">
        <!-- Search Input -->
        <div class="relative">
          <ng-icon
            name="lucideSearch"
            size="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            hlmInput
            type="text"
            formControlName="search"
            placeholder="Search by contributor name or email..."
            class="pl-9 pr-9"
            [attr.aria-label]="'Search contributions'"
          />
          @if (filterForm.get('search')?.value) {
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              (click)="clearSearch()"
              [attr.aria-label]="'Clear search'"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          }
        </div>

        <!-- Filter Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Payment Status Filter -->
          <div>
            <label for="payment-status" class="text-sm font-medium mb-1.5 block">Status</label>
            <select
              id="payment-status"
              hlmInput
              formControlName="paymentStatus"
              class="w-full"
              [attr.aria-label]="'Filter by payment status'"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <!-- Project Filter -->
          <div>
            <label for="project-filter" class="text-sm font-medium mb-1.5 block">Project</label>
            <select
              id="project-filter"
              hlmInput
              formControlName="projectId"
              class="w-full"
              [attr.aria-label]="'Filter by project'"
            >
              <option value="">All Projects</option>
              @for (project of projects(); track project.id) {
                <option [value]="project.id">{{ project.title }}</option>
              }
            </select>
          </div>

          <!-- Min Amount Filter -->
          <div>
            <label for="min-amount" class="text-sm font-medium mb-1.5 block">Min Amount</label>
            <input
              id="min-amount"
              hlmInput
              type="number"
              formControlName="minAmount"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="w-full"
              [attr.aria-label]="'Minimum amount'"
            />
          </div>

          <!-- Max Amount Filter -->
          <div>
            <label for="max-amount" class="text-sm font-medium mb-1.5 block">Max Amount</label>
            <input
              id="max-amount"
              hlmInput
              type="number"
              formControlName="maxAmount"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="w-full"
              [attr.aria-label]="'Maximum amount'"
            />
          </div>
        </div>

        <!-- Date Range Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Start Date Filter -->
          <div>
            <label for="start-date" class="text-sm font-medium mb-1.5 block">Start Date</label>
            <input
              id="start-date"
              hlmInput
              type="date"
              formControlName="startDate"
              class="w-full"
              [attr.aria-label]="'Start date'"
            />
          </div>

          <!-- End Date Filter -->
          <div>
            <label for="end-date" class="text-sm font-medium mb-1.5 block">End Date</label>
            <input
              id="end-date"
              hlmInput
              type="date"
              formControlName="endDate"
              class="w-full"
              [attr.aria-label]="'End date'"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            hlmBtn
            type="button"
            variant="outline"
            size="sm"
            (click)="clearFilters()"
            [disabled]="!hasActiveFilters()"
          >
            <ng-icon name="lucideX" size="16" class="mr-2" />
            Clear Filters
          </button>
          
          @if (hasActiveFilters()) {
            <span class="text-sm text-muted-foreground flex items-center">
              {{ getActiveFilterCount() }} filter(s) active
            </span>
          }
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ContributionFiltersComponent {
  private fb = new FormBuilder();

  // Inputs
  filters = input<IContributionFilter>({});
  projects = input<IProject[]>([]);

  // Outputs
  filtersChange = output<IContributionFilter>();

  // Form
  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      paymentStatus: [''],
      projectId: [''],
      minAmount: [null],
      maxAmount: [null],
      startDate: [''],
      endDate: [''],
    });

    // Set up form value changes with debounce
    effect(() => {
      this.filterForm.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.emitFilters();
        });
    });

    // Initialize form with input filters
    effect(() => {
      const filters = this.filters();
      if (filters) {
        this.filterForm.patchValue({
          search: filters.search || '',
          paymentStatus: filters.paymentStatus || '',
          projectId: filters.projectId || '',
          minAmount: filters.minAmount || null,
          maxAmount: filters.maxAmount || null,
          startDate: filters.startDate ? this.formatDateForInput(filters.startDate) : '',
          endDate: filters.endDate ? this.formatDateForInput(filters.endDate) : '',
        }, { emitEvent: false });
      }
    });
  }

  emitFilters(): void {
    const formValue = this.filterForm.value;
    const filters: IContributionFilter = {};

    if (formValue.search) {
      filters.search = formValue.search;
    }
    if (formValue.paymentStatus) {
      filters.paymentStatus = formValue.paymentStatus as IPaymentStatus;
    }
    if (formValue.projectId) {
      filters.projectId = formValue.projectId;
    }
    if (formValue.minAmount !== null && formValue.minAmount !== '') {
      filters.minAmount = parseFloat(formValue.minAmount);
    }
    if (formValue.maxAmount !== null && formValue.maxAmount !== '') {
      filters.maxAmount = parseFloat(formValue.maxAmount);
    }
    if (formValue.startDate) {
      filters.startDate = new Date(formValue.startDate).toISOString();
    }
    if (formValue.endDate) {
      filters.endDate = new Date(formValue.endDate).toISOString();
    }

    this.filtersChange.emit(filters);
  }

  clearSearch(): void {
    this.filterForm.patchValue({ search: '' });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      paymentStatus: '',
      projectId: '',
      minAmount: null,
      maxAmount: null,
      startDate: '',
      endDate: '',
    });
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(
      formValue.search ||
      formValue.paymentStatus ||
      formValue.projectId ||
      formValue.minAmount !== null ||
      formValue.maxAmount !== null ||
      formValue.startDate ||
      formValue.endDate
    );
  }

  getActiveFilterCount(): number {
    const formValue = this.filterForm.value;
    let count = 0;
    if (formValue.search) count++;
    if (formValue.paymentStatus) count++;
    if (formValue.projectId) count++;
    if (formValue.minAmount !== null && formValue.minAmount !== '') count++;
    if (formValue.maxAmount !== null && formValue.maxAmount !== '') count++;
    if (formValue.startDate) count++;
    if (formValue.endDate) count++;
    return count;
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
}
