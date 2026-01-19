import { Component, Input, OnInit, OnChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '@nyots/data-source/dashboard';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import {
  HlmTable,
  HlmTBody,
  HlmTd,
  HlmTh,
  HlmTHead,
  HlmTr,
} from '@nyots/ui/table';
import { HlmBadge } from '@nyots/ui/badge';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmTabs, HlmTabsContent, HlmTabsList, HlmTabsTrigger } from '@nyots/ui/tabs';

@Component({
  selector: 'nyots-recent-activity',
  imports: [
    CommonModule,
    RouterLink,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
    HlmTable,
    HlmTBody,
    HlmTd,
    HlmTh,
    HlmTHead,
    HlmTr,
    HlmBadge,
    HlmSpinner,
    HlmTabs,
    HlmTabsContent,
    HlmTabsList,
    HlmTabsTrigger,
  ],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Recent Activity</h3>
        <p hlmCardDescription>Latest contributions, projects, and users</p>
      </div>
      <div hlmCardContent>
        <div hlmTabs tab="contributions">
          <div hlmTabsList class="grid w-full grid-cols-3">
            <button hlmTabsTrigger value="contributions">Contributions</button>
            <button hlmTabsTrigger value="projects">Projects</button>
            <button hlmTabsTrigger value="users">Users</button>
          </div>

          <!-- Contributions Tab -->
          <div hlmTabsContent value="contributions">
            @if (loadingContributions()) {
              <div class="flex items-center justify-center h-32">
                <hlm-spinner></hlm-spinner>
              </div>
            } @else {
              <table hlmTable>
                <thead hlmTHead>
                  <tr hlmTr>
                    <th hlmTh>User</th>
                    <th hlmTh>Project</th>
                    <th hlmTh>Amount</th>
                    <th hlmTh>Status</th>
                    <th hlmTh>Date</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (contribution of recentContributions(); track contribution.id) {
                    <tr hlmTr>
                      <td hlmTd>
                        {{ contribution.user.firstName }} {{ contribution.user.lastName }}
                      </td>
                      <td hlmTd>
                        <a
                          [routerLink]="['/dashboard/projects', contribution.project.id]"
                          class="text-primary hover:underline"
                        >
                          {{ contribution.project.title }}
                        </a>
                      </td>
                      <td hlmTd>
                        {{ formatCurrency(contribution.amount) }}
                      </td>
                      <td hlmTd>
                        <span
                          hlmBadge
                          [variant]="getStatusVariant(contribution.paymentStatus)"
                        >
                          {{ contribution.paymentStatus }}
                        </span>
                      </td>
                      <td hlmTd>
                        {{ formatDate(contribution.createdAt) }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <!-- Projects Tab -->
          <div hlmTabsContent value="projects">
            @if (loadingProjects()) {
              <div class="flex items-center justify-center h-32">
                <hlm-spinner></hlm-spinner>
              </div>
            } @else {
              <table hlmTable>
                <thead hlmTHead>
                  <tr hlmTr>
                    <th hlmTh>Title</th>
                    <th hlmTh>Category</th>
                    <th hlmTh>Goal</th>
                    <th hlmTh>Current</th>
                    <th hlmTh>Status</th>
                    <th hlmTh>Created</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (project of recentProjects(); track project.id) {
                    <tr hlmTr>
                      <td hlmTd>
                        <a
                          [routerLink]="['/dashboard/projects', project.id]"
                          class="text-primary hover:underline"
                        >
                          {{ project.title }}
                        </a>
                      </td>
                      <td hlmTd>{{ project.category.name }}</td>
                      <td hlmTd>{{ formatCurrency(project.goalAmount) }}</td>
                      <td hlmTd>{{ formatCurrency(project.currentAmount) }}</td>
                      <td hlmTd>
                        <span hlmBadge [variant]="getProjectStatusVariant(project.status)">
                          {{ project.status }}
                        </span>
                      </td>
                      <td hlmTd>{{ formatDate(project.createdAt) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <!-- Users Tab -->
          <div hlmTabsContent value="users">
            @if (loadingUsers()) {
              <div class="flex items-center justify-center h-32">
                <hlm-spinner></hlm-spinner>
              </div>
            } @else {
              <table hlmTable>
                <thead hlmTHead>
                  <tr hlmTr>
                    <th hlmTh>Name</th>
                    <th hlmTh>Email</th>
                    <th hlmTh>Joined</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (user of recentUsers(); track user.id) {
                    <tr hlmTr>
                      <td hlmTd>
                        {{ user.firstName }} {{ user.lastName }}
                      </td>
                      <td hlmTd>{{ user.email }}</td>
                      <td hlmTd>{{ formatDate(user.createdAt) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RecentActivityComponent implements OnInit, OnChanges {
  @Input() dateRange: { startDate?: Date; endDate?: Date } = {};

  private dashboardService = inject(DashboardService);

  loadingContributions = signal(true);
  loadingProjects = signal(true);
  loadingUsers = signal(true);

  recentContributions = signal<any[]>([]);
  recentProjects = signal<any[]>([]);
  recentUsers = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges() {
    this.loadData();
  }

  loadData() {
    this.loadContributions();
    this.loadProjects();
    this.loadUsers();
  }

  loadContributions() {
    this.loadingContributions.set(true);
    this.dashboardService.getRecentContributions(10).subscribe({
      next: (data) => {
        this.recentContributions.set(data);
        this.loadingContributions.set(false);
      },
      error: (error) => {
        console.error('Error loading recent contributions:', error);
        this.loadingContributions.set(false);
      },
    });
  }

  loadProjects() {
    this.loadingProjects.set(true);
    this.dashboardService.getRecentProjects(5).subscribe({
      next: (data) => {
        this.recentProjects.set(data);
        this.loadingProjects.set(false);
      },
      error: (error) => {
        console.error('Error loading recent projects:', error);
        this.loadingProjects.set(false);
      },
    });
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.dashboardService.getRecentUsers(5).subscribe({
      next: (data) => {
        this.recentUsers.set(data);
        this.loadingUsers.set(false);
      },
      error: (error) => {
        console.error('Error loading recent users:', error);
        this.loadingUsers.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PAID: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      REFUNDED: 'outline',
    };
    return statusMap[status.toLowerCase()] || 'outline';
  }

  getProjectStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      DRAFT: 'secondary',
      PENDING: 'secondary',
      COMPLETED: 'outline',
      ARCHIVED: 'destructive',
    };
    return statusMap[status.toLowerCase()] || 'outline';
  }
}
