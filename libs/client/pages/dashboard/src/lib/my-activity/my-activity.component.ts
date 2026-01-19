import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { HlmButton } from '@nyots/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHistory,
  lucideCalendar,
  lucideActivity,
  lucideRefreshCw,
  lucideChevronLeft,
  lucideChevronRight,
  lucideLogIn,
  lucideEdit,
  lucideFolderPlus,
  lucideDollarSign,
  lucideCheckCircle,
  lucideUser,
  lucideFileText,
} from '@ng-icons/lucide';
import { ActivityService } from '@nyots/data-source/activity';
import type { IActivityAction } from '@nyots/data-source';

interface ActivityNode {
  id: string;
  action: IActivityAction;
  targetId?: string | null;
  targetType?: string | null;
  details?: string | null;
  createdAt: string;
}

@Component({
  selector: 'nyots-my-activity',
  standalone: true,
  imports: [
    CommonModule,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmIcon,
    HlmButton,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHistory,
      lucideCalendar,
      lucideActivity,
      lucideRefreshCw,
      lucideChevronLeft,
      lucideChevronRight,
      lucideLogIn,
      lucideEdit,
      lucideFolderPlus,
      lucideDollarSign,
      lucideCheckCircle,
      lucideUser,
      lucideFileText,
    }),
  ],
  templateUrl: './my-activity.component.html',
  styleUrls: ['./my-activity.component.scss'],
})
export class MyActivityComponent implements OnInit {
  private readonly activityService = inject(ActivityService);

  activities = signal<ActivityNode[]>([]);
  isLoading = signal(false);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);
  totalCount = signal(0);
  currentCursor = signal<string | null>(null);
  pageSize = 20;

  // Get current user from localStorage
  currentUser = computed(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    const user = this.currentUser();
    if (!user || !user.id) {
      toast.error('User not authenticated');
      return;
    }

    this.isLoading.set(true);

    // Build filter to only show current user's activities
    const filter = {
      userId: user.id,
    };

    // Build pagination
    const pagination: Record<string, unknown> = {
      first: this.pageSize,
    };

    if (this.currentCursor()) {
      pagination['after'] = this.currentCursor();
    }

    this.activityService.getActivities(filter, pagination).subscribe({
      next: (result) => {
        if (result) {
          this.activities.set(result.edges.map((edge) => edge.node));
          this.hasNextPage.set(result.pageInfo.hasNextPage);
          this.hasPreviousPage.set(result.pageInfo.hasPreviousPage);
          this.totalCount.set(result.totalCount);
        }
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Failed to load your activity history');
        this.isLoading.set(false);
      },
    });
  }

  nextPage() {
    if (this.hasNextPage() && this.activities().length > 0) {
      const lastActivity = this.activities()[this.activities().length - 1];
      this.currentCursor.set(lastActivity.id);
      this.loadActivities();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.hasPreviousPage()) {
      this.currentCursor.set(null);
      this.loadActivities();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  refresh() {
    this.currentCursor.set(null);
    this.loadActivities();
  }

  getActionIcon(action: IActivityAction): string {
    const iconMap: Record<string, string> = {
      USER_LOGIN: 'lucideLogIn',
      USER_UPDATED: 'lucideEdit',
      PROJECT_CREATED: 'lucideFolderPlus',
      CONTRIBUTION_CREATED: 'lucideDollarSign',
      CONTRIBUTION_UPDATED: 'lucideCheckCircle',
    };
    return iconMap[action] || 'lucideActivity';
  }

  getActionColor(action: IActivityAction): string {
    const colorMap: Record<string, string> = {
      USER_LOGIN: 'text-green-600 bg-green-100',
      USER_UPDATED: 'text-blue-600 bg-blue-100',
      PROJECT_CREATED: 'text-purple-600 bg-purple-100',
      CONTRIBUTION_CREATED: 'text-indigo-600 bg-indigo-100',
      CONTRIBUTION_UPDATED: 'text-emerald-600 bg-emerald-100',
    };
    return colorMap[action] || 'text-gray-600 bg-gray-100';
  }

  getActivityDescription(activity: ActivityNode): string {
    try {
      const details = activity.details ? JSON.parse(activity.details) : {};
      const action = activity.action;

      switch (action) {
        case 'USER_LOGIN': {
          return 'You logged into your account';
        }
        
        case 'USER_UPDATED': {
          const changes = details.changes ? Object.keys(details.changes) : [];
          if (changes.length > 0) {
            return `You updated your profile (${changes.join(', ')})`;
          }
          return 'You updated your profile';
        }
        
        case 'PROJECT_CREATED': {
          return details.title 
            ? `You created a new project "${details.title}"`
            : 'You created a new project';
        }
        
        case 'CONTRIBUTION_CREATED': {
          return details.amount
            ? `You made a contribution of $${details.amount}`
            : 'You made a contribution';
        }
        
        case 'CONTRIBUTION_UPDATED': {
          if (details.paymentSuccess === true) {
            return details.amount
              ? `Your payment of $${details.amount} was processed successfully`
              : 'Your payment was processed successfully';
          } else if (details.paymentSuccess === false) {
            return details.failureReason
              ? `Your payment failed: ${details.failureReason}`
              : 'Your payment failed';
          } else if (details.status === 'Refunded') {
            return details.amount
              ? `Your contribution of $${details.amount} was refunded`
              : 'Your contribution was refunded';
          }
          return 'Your contribution was updated';
        }
        
        default:
          return this.getActionLabel(action);
      }
    } catch {
      return this.getActionLabel(activity.action);
    }
  }

  getActionLabel(action: IActivityAction): string {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
  }

  formatTimestamp(date: string): string {
    const activityDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - activityDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return activityDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatFullTimestamp(date: string): string {
    const activityDate = new Date(date);
    return activityDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
