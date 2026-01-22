import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { toast } from 'ngx-sonner';
import { DashboardService } from '@nyots/data-source/dashboard';
import { HlmButton } from '@nyots/ui/button';
import { HlmSpinner } from '@nyots/ui/spinner';
import { StatsCardComponent } from './components/stats-card.component';
import { ContributionTrendChartComponent } from './components/contribution-trend-chart.component';
import { ProjectStatusChartComponent } from './components/project-status-chart.component';
import { PaymentStatusChartComponent } from './components/payment-status-chart.component';
import { TopProjectsChartComponent } from './components/top-projects-chart.component';
import { RecentActivityComponent } from './components/recent-activity.component';
import { DateRangeFilterComponent } from './components/date-range-filter.component';
import { UserService } from '@nyots/data-source/user';
import { ProjectService } from '@nyots/data-source/projects';
import { IUser } from '@nyots/data-source';
import { debounceTime, distinctUntilChanged, Observable, of, forkJoin, firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nyots-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Added for potential use with HlmCheckbox or other components
    HlmButton,
    HlmSpinner,
    StatsCardComponent,
    ContributionTrendChartComponent,
    ProjectStatusChartComponent,
    PaymentStatusChartComponent,
    TopProjectsChartComponent,
    RecentActivityComponent,
    DateRangeFilterComponent,
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p class="text-muted-foreground">
            Monitor your platform's performance and activity
          </p>
        </div>
        <div class="flex items-center gap-2">
          <nyots-date-range-filter
            (dateRangeChange)="onDateRangeChange($event)"
          />
          <button hlmBtn variant="outline" (click)="exportData()">
            Export Data
          </button>
          <button hlmBtn variant="outline" (click)="refreshData()">
            Refresh
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-96">
          <hlm-spinner />
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <app-stats-card
            title="Total Users"
            [value]="stats()?.totalUsers || 0"
            icon="users"
            trend="+12%"
            trendDirection="up"
          />
          <app-stats-card
            title="Active Projects"
            [value]="stats()?.activeProjects || 0"
            icon="folder"
            trend="+5%"
            trendDirection="up"
          />
          <app-stats-card
            title="Total Contributions"
            [value]="stats()?.totalContributions || 0"
            icon="dollar"
            trend="+18%"
            trendDirection="up"
          />
          <app-stats-card
            title="Total Revenue"
            [value]="formatCurrency(stats()?.totalRevenue || 0)"
            icon="trending"
            trend="+23%"
            trendDirection="up"
          />
        </div>

        <!-- Charts Row 1 -->
        <div class="grid gap-4 md:grid-cols-2">
          <nyots-contribution-trend-chart
            [dateRange]="dateRange()"
          />
          <nyots-project-status-chart
            [data]="stats()?.projectsByStatus || []"
          />
        </div>

        <!-- Charts Row 2 -->
        <div class="grid gap-4 md:grid-cols-2">
          <nyots-payment-status-chart
            [data]="stats()?.contributionsByStatus || []"
          />
          <nyots-top-projects-chart
            [dateRange]="dateRange()"
          />
        </div>

        <!-- Recent Activity -->
        <nyots-recent-activity [dateRange]="dateRange()" />
      }
    </div>
  `,
})
export class OverviewComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private userService = inject(UserService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(true);
  stats = signal<any>(null);
  previousStats = signal<any>(null); // For comparison
  allUsers = signal<IUser[]>([]);
  allProjects = signal<{ id: string; title: string }[]>([]);

  filterForm = this.fb.group({
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null),
    userId: new FormControl<string | null>(null),
    projectId: new FormControl<string | null>(null),
    compareWithPreviousPeriod: new FormControl<boolean>(false),
  });

  // Combine filter form values and dateRange from DateRangeFilterComponent
  // The DateRangeFilterComponent already provides a signal dateRange, we'll use that.
  // The filterForm will manage userId, projectId, and compareWithPreviousPeriod
  // The dateRange signal from DateRangeFilterComponent will be updated by onDateRangeChange.


  // Combine filter form values and dateRange from DateRangeFilterComponent
  // The DateRangeFilterComponent already provides a signal dateRange, we'll use that.
  // The filterForm will manage userId, projectId, and compareWithPreviousPeriod
  // The dateRange signal from DateRangeFilterComponent will be updated by onDateRangeChange.
  dateRange = signal<{ startDate?: Date; endDate?: Date }>({});

  ngOnInit() {
    this.loadFilterOptions();

    // Subscribe to query params changes to update the form and trigger data loading
    this.route.queryParams
      .pipe(
        debounceTime(100), // Debounce to avoid multiple loads on rapid param changes
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      )
      .subscribe((params) => {
        // Update form from query params
        this.filterForm.patchValue(
          {
            startDate: params['startDate'] || null,
            endDate: params['endDate'] || null,
            userId: params['userId'] || null,
            projectId: params['projectId'] || null,
            compareWithPreviousPeriod: params['compareWithPreviousPeriod'] === 'true',
          },
          { emitEvent: false }, // Prevent valueChanges from triggering loadDashboardData immediately
        );

        // Update dateRange signal from DateRangeFilterComponent if params exist
        this.dateRange.set({
          startDate: params['startDate'] ? new Date(params['startDate']) : undefined,
          endDate: params['endDate'] ? new Date(params['endDate']) : undefined,
        });

        this.loadDashboardData();
      });

    // Subscribe to form changes to update URL query params
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Debounce to prevent frequent URL updates
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      )
      .subscribe((values) => {
        this.updateQueryParams(values);
      });
  }

  async loadFilterOptions() {
    try {
      // Fetch all users
      const allUsersResult = await this.userService.getAllUsers({
        pagination: { first: 1000 }, // Fetch a reasonable number of users for dropdown
      }) // Convert observable to promise
      if (allUsersResult?.edges) {
        this.allUsers.set(allUsersResult.edges.map(edge => edge.node).filter((u): u is IUser => !!u));
      }

      // Fetch all projects
      const allProjectsResult = await firstValueFrom(this.projectService.getAllProjects({
        pagination: { first: 1000 }, // Fetch a reasonable number of projects for dropdown
      })); // Convert observable to promise
      if (allProjectsResult?.edges) {
        this.allProjects.set(allProjectsResult.edges.map(edge => ({ id: edge.node.id, title: edge.node.title })));
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error('Failed to load filter options');
    }
  }

  async loadDashboardData() {
    this.loading.set(true);
    const formValue = this.filterForm.value;

    const currentStartDate = formValue.startDate ? new Date(formValue.startDate) : undefined;
    const currentEndDate = formValue.endDate ? new Date(formValue.endDate) : undefined;
    const userId = formValue.userId || undefined;
    const projectId = formValue.projectId || undefined;
    const compare = formValue.compareWithPreviousPeriod;

    try {
      // Fetch current period stats
      const currentStatsObservable = this.dashboardService.getDashboardStats({
        startDate: currentStartDate,
        endDate: currentEndDate,
        userId,
        projectId,
      });

      // Fetch previous period stats if comparison is enabled
      let previousStatsObservable: Observable<any | null> = of(null);
      if (compare && currentStartDate && currentEndDate) {
        const {
          startDate: prevStartDate,
          endDate: prevEndDate
        } = this.getPreviousPeriodDateRange(currentStartDate, currentEndDate);
        previousStatsObservable = this.dashboardService.getDashboardStats({
          startDate: prevStartDate,
          endDate: prevEndDate,
          userId,
          projectId,
        });
      }

      // Combine observables to wait for both (or just current if no comparison)
      const [currentStatsData, previousStatsData] = await firstValueFrom(
        forkJoin([currentStatsObservable, previousStatsObservable])
      );

      this.stats.set(currentStatsData);
      this.previousStats.set(previousStatsData);

      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard data');
      this.stats.set(null);
      this.previousStats.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private updateQueryParams(values: any) {
    const queryParams: Params = {};
    if (values.startDate) queryParams['startDate'] = values.startDate;
    if (values.endDate) queryParams['endDate'] = values.endDate;
    if (values.userId) queryParams['userId'] = values.userId;
    if (values.projectId) queryParams['projectId'] = values.projectId;
    if (values.compareWithPreviousPeriod) queryParams['compareWithPreviousPeriod'] = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge', // Merge with existing params
      replaceUrl: true, // Replace the current URL state instead of adding to history
    });
  }

  onDateRangeChange(range: { startDate?: Date; endDate?: Date }) {
    this.filterForm.patchValue({
      startDate: range.startDate?.toISOString().split('T')[0] || null,
      endDate: range.endDate?.toISOString().split('T')[0] || null,
    });
    // The subscription to valueChanges will handle loadDashboardData
  }

  refreshData() {
    toast.info('Refreshing dashboard data...');
    this.loadDashboardData();
  }

  exportData() {
    // Existing export logic remains, but now includes filters from filterForm
    const filters = this.filterForm.value;
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
    const userId = filters.userId || undefined;
    const projectId = filters.projectId || undefined;

    this.dashboardService.exportDashboardData(
      { startDate, endDate, userId, projectId } // Pass new filters
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Dashboard data exported successfully');
      },
      error: (error) => {
        console.error('Error exporting data:', error);
        toast.error('Failed to export dashboard data');
      },
    });
  }

  private getPreviousPeriodDateRange(currentStartDate: Date, currentEndDate: Date) {
    const diffTime = Math.abs(currentEndDate.getTime() - currentStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const prevEndDate = new Date(currentStartDate);
    prevEndDate.setDate(currentStartDate.getDate() - 1); // Day before current start

    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - diffDays); // Go back by the duration of the current period

    return { startDate: prevStartDate, endDate: prevEndDate };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
}
