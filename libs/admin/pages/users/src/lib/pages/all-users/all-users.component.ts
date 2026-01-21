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
  lucideUserX,
  lucideUsers,
} from '@ng-icons/lucide';
import { ConfirmationDialogComponent, HlmDialogService } from '@nyots/ui/dialog';
import { BulkAssignRoleDialog, BulkBanUsersDialog, IRole } from '@nyots/admin/ui/dialogs';

export interface BulkOperationResult {
  successCount: number;
  failureCount: number;
  failedIds: string[];
}

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
      lucideUserX,
      lucideUsers,
    }),
  ],
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly dialogService = inject(HlmDialogService);

  // State management using signals
  users = signal<IUser[]>([]);
  isLoading = signal(false);
  isProcessing = signal(false);
  searchTerm = signal('');
  debouncedSearchTerm = signal('');
  selectedUsers = signal<Set<string>>(new Set());
  availableRoles = signal<IRole[]>([]);

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
    this.loadRoles();

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
   * Load available roles (mock for now)
   */
  async loadRoles() {
    // In a real application, fetch roles from a service
    this.availableRoles.set([
      { id: '1', name: 'Admin' },
      { id: '2', name: 'Editor' },
      { id: '3', name: 'Viewer' },
    ]);
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
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      },
    });

    dialogRef.closed$.subscribe(async (confirmed) => {
      if (confirmed) {
        this.isProcessing.set(true);
        try {
          // Assuming a deleteUser method in UserService
          await this.userService.deleteUser(userId);
          toast.success('User deleted successfully');
          this.loadUsers();
          this.clearSelection();
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user');
        } finally {
          this.isProcessing.set(false);
        }
      }
    });
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
   * Clear selection
   */
  clearSelection() {
    this.selectedUsers.set(new Set());
  }

  /**
   * Handle bulk assign role
   */
  async handleBulkAssignRole() {
    const selectedIds = Array.from(this.selectedUsers());
    if (selectedIds.length === 0) {
      toast.error('No users selected');
      return;
    }

    this.isProcessing.set(true);
    const dialogRef = this.dialogService.open(BulkAssignRoleDialog, {
      context: { userIds: selectedIds, availableRoles: this.availableRoles() },
    });

    dialogRef.closed$.subscribe(async (selectedRole) => {
      if (selectedRole) {
        try {
          const result = await this.userService.bulkAssignRole(selectedIds, selectedRole.id);
          this.showBulkOperationResult(result, `Assigned role '${selectedRole.name}'`);
          this.loadUsers();
          this.clearSelection();
        } catch (error) {
          console.error('Error bulk assigning roles:', error);
          toast.error('Failed to assign roles');
        } finally {
          this.isProcessing.set(false);
        }
      } else {
        this.isProcessing.set(false);
      }
    });
  }

  /**
   * Handle bulk delete users
   */
  async handleBulkDeleteUsers() {
    const selectedIds = Array.from(this.selectedUsers());
    if (selectedIds.length === 0) {
      toast.error('No users selected');
      return;
    }

    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Delete Selected Users',
        message: `Are you sure you want to delete ${selectedIds.length} selected user(s)? This action cannot be undone.`,
        confirmLabel: 'Delete All',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      },
    });

    dialogRef.closed$.subscribe(async (confirmed) => {
      if (confirmed) {
        this.isProcessing.set(true);
        try {
          const result = await this.userService.bulkDeleteUsers(selectedIds);
          this.showBulkOperationResult(result, 'Deleted');
          this.loadUsers();
          this.clearSelection();
        } catch (error) {
          console.error('Error bulk deleting users:', error);
          toast.error('Failed to delete users');
        } finally {
          this.isProcessing.set(false);
        }
      }
    });
  }

  /**
   * Handle bulk ban users
   */
  async handleBulkBanUsers() {
    const selectedIds = Array.from(this.selectedUsers());
    if (selectedIds.length === 0) {
      toast.error('No users selected');
      return;
    }

    this.isProcessing.set(true);
    const dialogRef = this.dialogService.open(BulkBanUsersDialog, {
      context: { userIds: selectedIds },
    });

    dialogRef.closed$.subscribe(async (reason) => {
      if (reason) {
        try {
          // Assuming adminId is available, e.g., from an auth service
          const adminId = 'currentAdminUserId'; // Placeholder
          const result = await this.userService.bulkBanUsers(selectedIds, reason, adminId);
          this.showBulkOperationResult(result, 'Banned');
          this.loadUsers();
          this.clearSelection();
        } catch (error) {
          console.error('Error bulk banning users:', error);
          toast.error('Failed to ban users');
        } finally {
          this.isProcessing.set(false);
        }
      } else {
        this.isProcessing.set(false);
      }
    });
  }

  /**
   * Helper to show bulk operation results
   */
  private showBulkOperationResult(result: BulkOperationResult, action: string) {
    if (result.successCount > 0) {
      toast.success(`Successfully ${action} ${result.successCount} user(s)`);
    }
    if (result.failureCount > 0) {
      toast.error(`Failed to ${action} ${result.failureCount} user(s). Failed IDs: ${result.failedIds.join(', ')}`);
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
