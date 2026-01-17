import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'nyots-overview',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
          <app-contribution-trend-chart
            [dateRange]="dateRange()"
          />
          <app-project-status-chart
            [data]="stats()?.projectsByStatus || []"
          />
        </div>

        <!-- Charts Row 2 -->
        <div class="grid gap-4 md:grid-cols-2">
          <app-payment-status-chart
            [data]="stats()?.contributionsByStatus || []"
          />
          <app-top-projects-chart
            [dateRange]="dateRange()"
          />
        </div>

        <!-- Recent Activity -->
        <app-recent-activity [dateRange]="dateRange()" />
      }
    </div>
  `,
})
export class OverviewComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  stats = signal<any>(null);
  dateRange = signal<{ startDate?: Date; endDate?: Date }>({});

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    this.dashboardService.getDashboardStats(this.dateRange()).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        toast.error('Failed to load dashboard data');
        this.loading.set(false);
      },
    });
  }

  onDateRangeChange(range: { startDate?: Date; endDate?: Date }) {
    this.dateRange.set(range);
    this.loadDashboardData();
  }

  refreshData() {
    toast.info('Refreshing dashboard data...');
    this.loadDashboardData();
  }

  exportData() {
    this.dashboardService.exportDashboardData(this.dateRange()).subscribe({
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
}
