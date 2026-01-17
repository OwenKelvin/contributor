import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { IUser } from '@nyots/data-source';
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
  lucideShield,
  lucideShieldOff,
  lucideCalendar,
  lucideAlertCircle,
} from '@ng-icons/lucide';

interface BannedUser extends IUser {
  bannedAt: Date;
  bannedBy: string;
  banReason: string;
}

@Component({
  selector: 'nyots-banned-users',
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
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideShield,
      lucideShieldOff,
      lucideCalendar,
      lucideAlertCircle,
    }),
  ],
  templateUrl: './banned-users.component.html',
  styleUrls: ['./banned-users.component.scss'],
})
export class BannedUsersComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  // State management
  bannedUsers = signal<BannedUser[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalUsers = signal(0);

  // Computed
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.bannedUsers();
    return this.bannedUsers().filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.banReason.toLowerCase().includes(term)
    );
  });

  totalPages = computed(() => Math.ceil(this.totalUsers() / this.pageSize()));

  constructor() {
    this.loadBannedUsers();
  }

  async loadBannedUsers() {
    this.isLoading.set(true);
    try {
      const result = await this.userService.getBannedUsers({
        first: this.pageSize(),
      });

      if (result) {
        // Map to BannedUser type with mock ban data
        // TODO: Update backend to include ban information
        const users = result.edges.map(edge => ({
          ...edge.node,
          bannedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          bannedBy: 'Admin',
          banReason: 'Violation of terms of service',
        })) as BannedUser[];

        this.bannedUsers.set(users);
        this.totalUsers.set(result.totalCount);
      }
    } catch (error) {
      console.error('Error loading banned users:', error);
      toast.error('Failed to load banned users');
    } finally {
      this.isLoading.set(false);
    }
  }

  getUserName(user: BannedUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async unbanUser(user: BannedUser) {
    if (confirm(`Are you sure you want to unban ${this.getUserName(user)}?`)) {
      try {
        await this.userService.unbanUser(user.id);
        toast.success('User unbanned successfully');
        await this.loadBannedUsers();
      } catch (error) {
        console.error('Error unbanning user:', error);
        toast.error('Failed to unban user');
      }
    }
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadBannedUsers();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadBannedUsers();
    }
  }
}
