import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { IUser, IPageInfo } from '@nyots/data-source';
import { UserService } from '@nyots/data-source/user';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideFilter,
  lucidePlus,
  lucideChevronLeft,
  lucideChevronRight,
  lucideEdit,
  lucideTrash2,
  lucideEye,
  lucideShield,
  lucideUserCheck,
} from '@ng-icons/lucide';

@Component({
  selector: 'nyots-all-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmIcon,
    NgIcon,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideFilter,
      lucidePlus,
      lucideChevronLeft,
      lucideChevronRight,
      lucideEdit,
      lucideTrash2,
      lucideEye,
      lucideShield,
      lucideUserCheck,
    }),
  ],
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  // State management using signals
  users = signal<IUser[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  debouncedSearchTerm = signal('');
  selectedUsers = signal<Set<string>>(new Set());

  // Pagination state
  pagination = signal<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  });
  currentCursor = signal<string | null>(null);
  totalUsers = signal(0);

  // Computed properties
  selectedCount = computed(() => this.selectedUsers().size);
  hasSelection = computed(() => this.selectedCount() > 0);
  displayedUsersEnd = computed(() => Math.min(this.users().length, this.totalUsers()));

  // Debounce timer for search
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Load initial data
    this.loadUsers();

    // Set up search debouncing
    effect(() => {
      const term = this.searchTerm();
      if (this.searchDebounceTimer !== null) {
        clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.debouncedSearchTerm.set(term);
        this.currentCursor.set(null);
        this.loadUsers();
      }, 300);
    });
  }

  /**
   * Load users with current search and pagination
   */
  async loadUsers() {
    this.isLoading.set(true);

    try {
      const result = await this.userService.getAllUsers({
        search: this.debouncedSearchTerm() || undefined,
        pagination: {
          first: 20,
          after: this.currentCursor() ?? undefined,
        },
      });

      if (result) {
        this.users.set(result.edges.map(edge => edge.node).filter((u): u is IUser => !!u));
        this.pagination.set({
          hasNextPage: result.pageInfo.hasNextPage ?? false,
          hasPreviousPage: result.pageInfo.hasPreviousPage ?? false,
          startCursor: result.pageInfo.startCursor ?? null,
          endCursor: result.pageInfo.endCursor ?? null,
        });
        this.totalUsers.set(result.totalCount);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle search input change
   */
  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  /**
   * Navigate to next page
   */
  async nextPage() {
    const pageInfo = this.pagination();
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      this.currentCursor.set(pageInfo.endCursor);
      await this.loadUsers();
    }
  }

  /**
   * Navigate to previous page
   */
  async previousPage() {
    if (this.pagination().hasPreviousPage) {
      this.currentCursor.set(null);
      await this.loadUsers();
    }
  }

  /**
   * Handle user edit action
   */
  onUserEdit(userId: string) {
    this.router.navigate(['/dashboard/users', userId, 'edit']);
  }

  /**
   * Handle user delete action
   */
  async onUserDelete(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await this.userService.deleteUser(userId);
        toast.success('User deleted successfully');
        await this.loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  }

  /**
   * Handle user view action
   */
  onUserView(userId: string) {
    this.router.navigate(['/dashboard/users', userId, 'view']);
  }

  /**
   * Toggle user selection
   */
  toggleUserSelection(userId: string) {
    const selected = new Set(this.selectedUsers());
    if (selected.has(userId)) {
      selected.delete(userId);
    } else {
      selected.add(userId);
    }
    this.selectedUsers.set(selected);
  }

  /**
   * Toggle all users selection
   */
  toggleAllUsers() {
    if (this.selectedUsers().size === this.users().length) {
      this.selectedUsers.set(new Set());
    } else {
      this.selectedUsers.set(new Set(this.users().map(u => u.id)));
    }
  }

  /**
   * Get user's full name
   */
  getUserName(user: IUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }

  /**
   * Get user's roles as string
   */
  getUserRoles(user: IUser): string {
    return user.roles?.map(r => r.name).join(', ') || 'No roles';
  }
}
