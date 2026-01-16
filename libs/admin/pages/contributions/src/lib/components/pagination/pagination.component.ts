import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideChevronsLeft, lucideChevronsRight } from '@ng-icons/lucide';
import { IPageInfo } from '@nyots/data-source';

export interface PaginationInfo extends IPageInfo {
  totalCount?: number;
  currentPageSize?: number;
}

export interface PageChangeEvent {
  endCursor?: string;
  startCursor?: string;
  direction: 'next' | 'previous' | 'first' | 'last';
  pageSize?: number;
}

@Component({
  selector: 'nyots-pagination',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
    }),
  ],
  template: `
    <div class="flex items-center justify-between gap-4 py-4">
      <!-- Page Info -->
      <div class="text-sm text-muted-foreground">
        @if (pageInfo()?.totalCount !== undefined) {
          <span>
            Showing
            <span class="font-medium">{{ getCurrentPageStart() }}</span>
            -
            <span class="font-medium">{{ getCurrentPageEnd() }}</span>
            of
            <span class="font-medium">{{ pageInfo()?.totalCount }}</span>
            results
          </span>
        } @else {
          <span>
            Page {{ currentPage() }}
          </span>
        }
      </div>

      <!-- Navigation Buttons -->
      <div class="flex items-center gap-2">
        <!-- First Page Button -->
        <button
          hlmBtn
          variant="outline"
          size="sm"
          (click)="goToFirstPage()"
          [disabled]="!pageInfo()?.hasPreviousPage || loading()"
          [attr.aria-label]="'Go to first page'"
        >
          <ng-icon hlmIcon name="lucideChevronsLeft" size="base" />
        </button>

        <!-- Previous Page Button -->
        <button
          hlmBtn
          variant="outline"
          size="sm"
          (click)="goToPreviousPage()"
          [disabled]="!pageInfo()?.hasPreviousPage || loading()"
          [attr.aria-label]="'Go to previous page'"
        >
          <ng-icon hlmIcon name="lucideChevronLeft" size="base" class="mr-1" />
          Previous
        </button>

        <!-- Page Size Selector -->
        <div class="flex items-center gap-2">
          <label for="page-size" class="text-sm text-muted-foreground">
            Per page:
          </label>
          <select
            id="page-size"
            class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
            [value]="pageSize()"
            (change)="onPageSizeChange($event)"
            [disabled]="loading()"
            [attr.aria-label]="'Items per page'"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <!-- Next Page Button -->
        <button
          hlmBtn
          variant="outline"
          size="sm"
          (click)="goToNextPage()"
          [disabled]="!pageInfo()?.hasNextPage || loading()"
          [attr.aria-label]="'Go to next page'"
        >
          Next
          <ng-icon hlmIcon name="lucideChevronRight" size="base" class="ml-1" />
        </button>

        <!-- Last Page Button -->
        <button
          hlmBtn
          variant="outline"
          size="sm"
          (click)="goToLastPage()"
          [disabled]="!pageInfo()?.hasNextPage || loading()"
          [attr.aria-label]="'Go to last page'"
        >
          <ng-icon hlmIcon name="lucideChevronsRight" size="base" />
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class PaginationComponent {
  // Inputs
  pageInfo = input.required<PaginationInfo | null>();
  pageSize = input<number>(20);
  loading = input<boolean>(false);

  // Outputs
  pageChange = output<PageChangeEvent>();

  // Computed values
  currentPage = computed(() => {
    // This is an approximation since we're using cursor-based pagination
    // In a real implementation, you might want to track this separately
    return 1;
  });

  getCurrentPageStart(): number {
    const totalCount = this.pageInfo()?.totalCount || 0;
    const currentPageSize = this.pageInfo()?.currentPageSize || this.pageSize();

    if (totalCount === 0) return 0;

    // For cursor-based pagination, we estimate based on whether we have previous pages
    if (!this.pageInfo()?.hasPreviousPage) {
      return 1;
    }

    // This is an approximation
    return Math.max(1, totalCount - currentPageSize);
  }

  getCurrentPageEnd(): number {
    const totalCount = this.pageInfo()?.totalCount || 0;
    const currentPageSize = this.pageInfo()?.currentPageSize || this.pageSize();

    if (totalCount === 0) return 0;

    return Math.min(this.getCurrentPageStart() + currentPageSize - 1, totalCount);
  }

  goToFirstPage(): void {
    if (this.pageInfo()?.hasPreviousPage) {
      this.pageChange.emit({
        direction: 'first',
        pageSize: this.pageSize(),
      });
    }
  }

  goToPreviousPage(): void {
    if (this.pageInfo()?.hasPreviousPage) {
      this.pageChange.emit({
        startCursor: this.pageInfo()?.startCursor || undefined,
        direction: 'previous',
        pageSize: this.pageSize(),
      });
    }
  }

  goToNextPage(): void {
    if (this.pageInfo()?.hasNextPage) {
      this.pageChange.emit({
        endCursor: this.pageInfo()?.endCursor || undefined,
        direction: 'next',
        pageSize: this.pageSize(),
      });
    }
  }

  goToLastPage(): void {
    if (this.pageInfo()?.hasNextPage) {
      this.pageChange.emit({
        direction: 'last',
        pageSize: this.pageSize(),
      });
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);

    this.pageChange.emit({
      direction: 'first',
      pageSize: newPageSize,
    });
  }
}
