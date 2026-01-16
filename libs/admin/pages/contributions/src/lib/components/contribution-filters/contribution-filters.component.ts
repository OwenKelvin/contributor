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
    <div class="space-y-4 p-4 bg-white rounded-lg border">
      <!-- Search Bar -->
      <div class="relative">
        <ng-icon
          hlmIcon
          name="lucideSearch"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size="sm"
        />
        <input
          hlmInput
          type="text"
          placeholder="Search contributions..."
          class="pl-10 pr-10"
          formControlName="search"
          [formGroup]="filterForm"
          [disabled]="loading()"
        />
        @if (filterForm.get('search')?.value) {
          <button
            hlmBtn
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            (click)="clearSearch()"
            type="button"
            [disabled]="loading()"
          >
            <ng-icon hlmIcon name="lucideX" size="sm" />
          </button>
        }
      </div>

      <!-- Filter Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" [formGroup]="filterForm">
        <!-- Status Filter -->
        <div>
          <label for="paymentStatus" class="text-sm font-medium mb-1.5 block">Status</label>
          <select
            id="paymentStatus"
            hlmInput
            formControlName="paymentStatus"
            class="w-full"
            [disabled]="loading()"
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
          <label for="projectId" class="text-sm font-medium mb-1.5 block">Project</label>
          <select
            id="projectId"
            hlmInput
            formControlName="projectId"
            class="w-full"
            [disabled]="loading()"
          >
            <option value="">All Projects</option>
            @for (project of projects(); track project.id) {
              <option [value]="project.id">{{ project.title }}</option>
            }
          </select>
        </div>

        <!-- Min Amount -->
        <div>
          <label for="minAmount" class="text-sm font-medium mb-1.5 block">Min Amount</label>
          <input
            id="minAmount"
            hlmInput
            type="number"
            placeholder="0.00"
            formControlName="minAmount"
            class="w-full"
            [disabled]="loading()"
          />
        </div>

        <!-- Max Amount -->
        <div>
          <label for="maxAmount" class="text-sm font-medium mb-1.5 block">Max Amount</label>
          <input
            id="maxAmount"
            hlmInput
            type="number"
            placeholder="0.00"
            formControlName="maxAmount"
            class="w-full"
            [disabled]="loading()"
          />
        </div>

        <!-- Start Date -->
        <div>
          <label for="startDate" class="text-sm font-medium mb-1.5 block">Start Date</label>
          <input
            id="startDate"
            hlmInput
            type="date"
            formControlName="startDate"
            class="w-full"
            [disabled]="loading()"
          />
        </div>

        <!-- End Date -->
        <div>
          <label for="endDate" class="text-sm font-medium mb-1.5 block">End Date</label>
          <input
            id="endDate"
            hlmInput
            type="date"
            formControlName="endDate"
            class="w-full"
            [disabled]="loading()"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-2">
        <button
          hlmBtn
          variant="outline"
          size="sm"
          (click)="clearFilters()"
          type="button"
          [disabled]="loading() || !hasActiveFilters()"
        >
          <ng-icon hlmIcon name="lucideX" size="sm" class="mr-2" />
          Clear Filters
        </button>

        @if (hasActiveFilters()) {
          <span class="text-sm text-gray-600">
            {{ getActiveFilterCount() }} filter(s) active
          </span>
        }

        @if (loading()) {
          <span class="text-sm text-gray-500 italic">
            Loading...
          </span>
        }
      </div>
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
  loading = input<boolean>(false);

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
