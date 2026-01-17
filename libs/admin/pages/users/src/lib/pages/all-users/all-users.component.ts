import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { IUser } from '@nyots/data-source';
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

  // State management using signals
  users = signal<IUser[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedUsers = signal<Set<string>>(new Set());

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(20);
  totalUsers = signal(0);

  // Computed properties
  selectedCount = computed(() => this.selectedUsers().size);
  hasSelection = computed(() => this.selectedCount() > 0);
  totalPages = computed(() => Math.ceil(this.totalUsers() / this.pageSize()));
  displayedUsersEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalUsers()));

  constructor() {
    // Load initial data
    this.loadUsers();
  }

  /**
   * Load users with current search and pagination
   */
  async loadUsers() {
    this.isLoading.set(true);

    try {
      // TODO: Replace with actual API call
      // Mock data for now
      const mockUsers: IUser[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          roles: [{ id: '1', name: 'Admin' }],
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+1234567891',
          roles: [{ id: '2', name: 'User' }],
        },
      ];

      this.users.set(mockUsers);
      this.totalUsers.set(mockUsers.length);
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
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   * Navigate to next page
   */
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadUsers();
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadUsers();
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
        // TODO: Implement delete API call
        console.log('Deleting user:', userId);
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
