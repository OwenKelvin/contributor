import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
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
  lucideHistory,
  lucideUser,
  lucideCalendar,
  lucideActivity,
  lucideFilter,
} from '@ng-icons/lucide';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
}

@Component({
  selector: 'nyots-user-activity',
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
      lucideHistory,
      lucideUser,
      lucideCalendar,
      lucideActivity,
      lucideFilter,
    }),
  ],
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
})
export class UserActivityComponent {
  // State management
  activities = signal<UserActivity[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedAction = signal<string>('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalActivities = signal(0);

  // Computed
  filteredActivities = computed(() => {
    let filtered = this.activities();
    const term = this.searchTerm().toLowerCase();
    
    if (term) {
      filtered = filtered.filter(
        (a) =>
          a.userName.toLowerCase().includes(term) ||
          a.userEmail.toLowerCase().includes(term) ||
          a.action.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedAction()) {
      filtered = filtered.filter((a) => a.action === this.selectedAction());
    }

    return filtered;
  });

  totalPages = computed(() => Math.ceil(this.totalActivities() / this.pageSize()));

  constructor() {
    this.loadActivities();
  }

  async loadActivities() {
    this.isLoading.set(true);
    try {
      // TODO: Replace with actual API call
      const mockActivities: UserActivity[] = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john.doe@example.com',
          action: 'LOGIN',
          description: 'User logged in successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          ipAddress: '192.168.1.1',
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane.smith@example.com',
          action: 'PROJECT_CREATED',
          description: 'Created new project "Community Garden"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          ipAddress: '192.168.1.2',
        },
        {
          id: '3',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john.doe@example.com',
          action: 'PROFILE_UPDATED',
          description: 'Updated profile information',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          ipAddress: '192.168.1.1',
        },
      ];

      this.activities.set(mockActivities);
      this.totalActivities.set(mockActivities.length);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load user activities');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  onActionFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedAction.set(value);
  }

  getActionBadgeClass(action: string): string {
    const classes: Record<string, string> = {
      LOGIN: 'bg-green-100 text-green-700',
      LOGOUT: 'bg-gray-100 text-gray-700',
      PROJECT_CREATED: 'bg-blue-100 text-blue-700',
      PROJECT_UPDATED: 'bg-yellow-100 text-yellow-700',
      PROJECT_DELETED: 'bg-red-100 text-red-700',
      PROFILE_UPDATED: 'bg-purple-100 text-purple-700',
      CONTRIBUTION_MADE: 'bg-indigo-100 text-indigo-700',
    };
    return classes[action] || 'bg-gray-100 text-gray-700';
  }

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadActivities();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadActivities();
    }
  }
}
