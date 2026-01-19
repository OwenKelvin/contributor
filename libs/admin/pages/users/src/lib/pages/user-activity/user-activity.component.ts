import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmButton } from '@nyots/ui/button';
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
  lucideRefreshCw,
  lucideChevronLeft,
  lucideChevronRight,
  lucideX,
  lucideFileText,
  lucideLogIn,
  lucideLogOut,
  lucideFolderPlus,
  lucideEdit,
  lucideTrash,
  lucideCheckCircle,
  lucideXCircle,
  lucideDollarSign,
} from '@ng-icons/lucide';
import { ActivityService } from '@nyots/data-source/activity';
import { UserService } from '@nyots/data-source/user';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { IActivityAction, ITargetType } from '@nyots/data-source';

interface ActivityNode {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  action: IActivityAction;
  targetId?: string | null;
  targetType?: ITargetType | null;
  details?: string | null;
  createdAt: any;
  updatedAt: any;
}

@Component({
  selector: 'nyots-user-activity',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInput,
    HlmLabel,
    HlmButton,
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
      lucideRefreshCw,
      lucideChevronLeft,
      lucideChevronRight,
      lucideX,
      lucideFileText,
      lucideLogIn,
      lucideLogOut,
      lucideFolderPlus,
      lucideEdit,
      lucideTrash,
      lucideCheckCircle,
      lucideXCircle,
      lucideDollarSign,
    }),
  ],
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
})
export class UserActivityComponent {

  private activityService = inject(ActivityService);

  // State management
  currentCursor = signal<string | null>(null);
  refreshTrigger = signal<number>(0);

  // Filter form
  filterForm = new FormGroup({
    userId: new FormControl<string>(''),
    action: new FormControl<IActivityAction | ''>(''),
    targetType: new FormControl<ITargetType | ''>(''),
    startDate: new FormControl<string>(''),
    endDate: new FormControl<string>(''),
    pageSize: new FormControl<number>(20),
  });

  // Convert the observable stream to a signal
  private activityResult = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(() => {
        // Reset cursor when filters change
        if (this.currentCursor() !== null) {
          this.currentCursor.set(null);
        }
        return this.fetchActivities();
      }),
      catchError(error => {
        console.error('Error loading activities:', error);
        toast.error('Failed to load activities');
        return of(null);
      })
    ),
    { initialValue: null }
  );

  // Computed signals derived from the result
  activities = computed(() => {
    const result = this.activityResult();
    return result?.edges.map(edge => edge.node) || [];
  });

  isLoading = computed(() => this.activityResult() === null);

  hasNextPage = computed(() => {
    const result = this.activityResult();
    return result?.pageInfo.hasNextPage || false;
  });

  hasPreviousPage = computed(() => {
    const result = this.activityResult();
    return result?.pageInfo.hasPreviousPage || false;
  });

  totalCount = computed(() => {
    const result = this.activityResult();
    return result?.totalCount || 0;
  });

  // Available filter options
  actionOptions: { value: IActivityAction | ''; label: string }[] = [
    { value: '', label: 'All Actions' },
    { value: 'USER_LOGIN' as IActivityAction, label: 'User Login' },
    { value: 'USER_LOGOUT' as IActivityAction, label: 'User Logout' },
    { value: 'USER_CREATED' as IActivityAction, label: 'User Created' },
    { value: 'USER_UPDATED' as IActivityAction, label: 'User Updated' },
    { value: 'USER_DELETED' as IActivityAction, label: 'User Deleted' },
    { value: 'PROJECT_CREATED' as IActivityAction, label: 'Project Created' },
    { value: 'PROJECT_UPDATED' as IActivityAction, label: 'Project Updated' },
    { value: 'PROJECT_DELETED' as IActivityAction, label: 'Project Deleted' },
    { value: 'PROJECT_APPROVED' as IActivityAction, label: 'Project Approved' },
    { value: 'PROJECT_REJECTED' as IActivityAction, label: 'Project Rejected' },
    { value: 'PROJECT_ARCHIVED' as IActivityAction, label: 'Project Archived' },
    { value: 'CONTRIBUTION_CREATED' as IActivityAction, label: 'Contribution Created' },
    { value: 'CONTRIBUTION_UPDATED' as IActivityAction, label: 'Contribution Updated' },
    { value: 'CONTRIBUTION_DELETED' as IActivityAction, label: 'Contribution Deleted' },
    { value: 'ROLE_CREATED' as IActivityAction, label: 'Role Created' },
    { value: 'ROLE_UPDATED' as IActivityAction, label: 'Role Updated' },
    { value: 'ROLE_DELETED' as IActivityAction, label: 'Role Deleted' },
    { value: 'ROLE_ASSIGNED' as IActivityAction, label: 'Role Assigned' },
    { value: 'ROLE_REVOKED' as IActivityAction, label: 'Role Revoked' },
  ];

  targetTypeOptions: { value: ITargetType | ''; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'User' as ITargetType, label: 'User' },
    { value: 'Project' as ITargetType, label: 'Project' },
    { value: 'Contribution' as ITargetType, label: 'Contribution' },
    { value: 'Role' as ITargetType, label: 'Role' },
    { value: 'Permission' as ITargetType, label: 'Permission' },
    { value: 'Category' as ITargetType, label: 'Category' },
  ];

  // Computed
  hasActiveFilters = computed(() => {
    const values = this.filterForm.value;
    return !!(
      values.userId ||
      values.action ||
      values.targetType ||
      values.startDate ||
      values.endDate
    );
  });

  private fetchActivities() {
    const formValues = this.filterForm.value;

    // Build filter object
    const filter: any = {};

    if (formValues.userId) {
      filter.userId = formValues.userId;
    }

    if (formValues.action) {
      filter.action = formValues.action;
    }

    if (formValues.targetType) {
      filter.targetType = formValues.targetType;
    }

    if (formValues.startDate && formValues.endDate) {
      filter.dateRange = {
        start: new Date(formValues.startDate).toISOString(),
        end: new Date(formValues.endDate).toISOString(),
      };
    }

    // Build pagination object
    const pagination: any = {
      first: formValues.pageSize || 20,
    };

    if (this.currentCursor()) {
      pagination.after = this.currentCursor();
    }

    // Return the observable
    return this.activityService.getActivities(
      Object.keys(filter).length > 0 ? filter : undefined,
      pagination
    );
  }

  nextPage() {
    if (this.hasNextPage() && this.activities().length > 0) {
      const lastActivity = this.activities()[this.activities().length - 1];
      this.currentCursor.set(lastActivity.id);
      // Trigger form value change to reload
      this.filterForm.patchValue(this.filterForm.value);
    }
  }

  previousPage() {
    if (this.hasPreviousPage()) {
      this.currentCursor.set(null);
      // Trigger form value change to reload
      this.filterForm.patchValue(this.filterForm.value);
    }
  }

  clearFilters() {
    this.filterForm.reset({
      userId: '',
      action: '',
      targetType: '',
      startDate: '',
      endDate: '',
      pageSize: 20,
    });
    this.currentCursor.set(null);
  }

  refresh() {
    this.currentCursor.set(null);
    // Trigger form value change to reload
    this.filterForm.patchValue(this.filterForm.value);
  }

  getUserName(activity: ActivityNode): string {
    const user = activity.user;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email;
  }

  getActionIcon(action: IActivityAction): string {
    const iconMap: Record<string, string> = {
      USER_LOGIN: 'lucideLogIn',
      USER_LOGOUT: 'lucideLogOut',
      USER_CREATED: 'lucideUser',
      USER_UPDATED: 'lucideEdit',
      USER_DELETED: 'lucideTrash',
      PROJECT_CREATED: 'lucideFolderPlus',
      PROJECT_UPDATED: 'lucideEdit',
      PROJECT_DELETED: 'lucideTrash',
      PROJECT_APPROVED: 'lucideCheckCircle',
      PROJECT_REJECTED: 'lucideXCircle',
      PROJECT_ARCHIVED: 'lucideFileText',
      CONTRIBUTION_CREATED: 'lucideDollarSign',
      CONTRIBUTION_UPDATED: 'lucideEdit',
      CONTRIBUTION_DELETED: 'lucideTrash',
      ROLE_CREATED: 'lucideUser',
      ROLE_UPDATED: 'lucideEdit',
      ROLE_DELETED: 'lucideTrash',
      ROLE_ASSIGNED: 'lucideCheckCircle',
      ROLE_REVOKED: 'lucideXCircle',
    };
    return iconMap[action] || 'lucideActivity';
  }

  getActionBadgeClass(action: IActivityAction): string {
    const classes: Record<string, string> = {
      USER_LOGIN: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      USER_LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      USER_CREATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      USER_UPDATED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      USER_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      PROJECT_CREATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      PROJECT_UPDATED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      PROJECT_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      PROJECT_APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      PROJECT_REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      PROJECT_ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      CONTRIBUTION_CREATED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
      CONTRIBUTION_UPDATED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      CONTRIBUTION_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      ROLE_CREATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      ROLE_UPDATED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      ROLE_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      ROLE_ASSIGNED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      ROLE_REVOKED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return classes[action] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }

  getActionLabel(action: IActivityAction): string {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getActivityDescription(activity: ActivityNode): string {
    try {
      const details = activity.details ? JSON.parse(activity.details) : {};
      const action = activity.action;

      // Generate human-readable descriptions based on action and details
      switch (action) {
        case 'USER_LOGIN':
          return 'Logged into the system';
        case 'USER_LOGOUT':
          return 'Logged out of the system';
        case 'USER_CREATED':
          return `Created user account${details.email ? ` for ${details.email}` : ''}`;
        case 'USER_UPDATED':
          return `Updated user profile${details.changes ? ': ' + Object.keys(details.changes).join(', ') : ''}`;
        case 'PROJECT_CREATED':
          return `Created project${details.title ? ` "${details.title}"` : ''}`;
        case 'PROJECT_UPDATED':
          return `Updated project${details.title ? ` "${details.title}"` : ''}`;
        case 'PROJECT_DELETED':
          return `Deleted project${details.title ? ` "${details.title}"` : ''}`;
        case 'PROJECT_APPROVED':
          return `Approved project${details.title ? ` "${details.title}"` : ''}`;
        case 'PROJECT_REJECTED':
          return `Rejected project${details.title ? ` "${details.title}"` : ''}${details.reason ? ` - ${details.reason}` : ''}`;
        case 'CONTRIBUTION_CREATED':
          return `Created contribution${details.amount ? ` of $${details.amount}` : ''}`;
        case 'CONTRIBUTION_UPDATED':
          if (details.paymentSuccess === true) {
            return `Payment processed successfully${details.amount ? ` for $${details.amount}` : ''}`;
          } else if (details.paymentSuccess === false) {
            return `Payment failed${details.failureReason ? `: ${details.failureReason}` : ''}`;
          } else if (details.status === 'Refunded') {
            return `Refunded contribution${details.amount ? ` of $${details.amount}` : ''}${details.reason ? ` - ${details.reason}` : ''}`;
          }
          return 'Updated contribution';
        case 'ROLE_ASSIGNED':
          return `Assigned role${details.roleId ? ` (${details.roleId})` : ''}`;
        case 'ROLE_REVOKED':
          return `Revoked role${details.roleId ? ` (${details.roleId})` : ''}`;
        default:
          return this.getActionLabel(action);
      }
    } catch (error) {
      return this.getActionLabel(activity.action);
    }
  }

  formatTimestamp(date: any): string {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatFullTimestamp(date: any): string {
    const activityDate = new Date(date);
    return activityDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
