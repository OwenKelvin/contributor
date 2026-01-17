import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';
import { ContributionService } from '@nyots/data-source/contributions';
import { IContributionReport, IReportType } from '@nyots/data-source';
import { ContributionChartComponent } from '../../components/contribution-chart/contribution-chart.component';
import { TopProjectsListComponent } from '../../components/top-projects-list/top-projects-list.component';
import { TopContributorsListComponent } from '../../components/top-contributors-list/top-contributors-list.component';

/**
 * Contribution Dashboard Component
 * 
 * Displays a comprehensive overview of contribution statistics including:
 * - Summary cards (total, pending, paid, failed, success rate)
 * - Contributions over time chart
 * - Top projects list
 * - Top contributors list
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7
 */
@Component({
  selector: 'nyots-contribution-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
    ContributionChartComponent,
    TopProjectsListComponent,
    TopContributorsListComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Contributions Dashboard</h1>
        <p class="text-muted-foreground">
          Overview of all contribution activity and statistics
        </p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-2">
            <hlm-spinner />
            <p class="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      } @else if (error()) {
        <div hlmCard>
          <div hlmCardContent class="py-12">
            <div class="flex flex-col items-center justify-center text-center">
              <div class="rounded-full bg-destructive/10 p-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-destructive"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
              <p class="text-sm text-muted-foreground mb-4">{{ error() }}</p>
              <button hlmBtn variant="outline" (click)="loadReport()">
                Try Again
              </button>
            </div>
          </div>
        </div>
      } @else if (report()) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <!-- Total Contributions Card -->
          <div hlmCard>
            <div hlmCardHeader class="pb-2">
              <h3 hlmCardTitle class="text-sm font-medium text-muted-foreground">
                Total Contributions
              </h3>
            </div>
            <div hlmCardContent>
              <div class="text-2xl font-bold">
                {{ report()!.totalAmount | currency }}
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                {{ report()!.totalContributions }} contributions
              </p>
            </div>
          </div>

          <!-- Pending Card -->
          <div hlmCard>
            <div hlmCardHeader class="pb-2">
              <h3 hlmCardTitle class="text-sm font-medium text-muted-foreground">
                Pending
              </h3>
            </div>
            <div hlmCardContent>
              <div class="text-2xl font-bold text-yellow-600">
                {{ report()!.pendingAmount | currency }}
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                {{ report()!.pendingCount }} pending
              </p>
            </div>
          </div>

          <!-- Paid Card -->
          <div hlmCard>
            <div hlmCardHeader class="pb-2">
              <h3 hlmCardTitle class="text-sm font-medium text-muted-foreground">
                Paid
              </h3>
            </div>
            <div hlmCardContent>
              <div class="text-2xl font-bold text-green-600">
                {{ report()!.paidAmount | currency }}
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                {{ report()!.paidCount }} paid
              </p>
            </div>
          </div>

          <!-- Success Rate Card -->
          <div hlmCard>
            <div hlmCardHeader class="pb-2">
              <h3 hlmCardTitle class="text-sm font-medium text-muted-foreground">
                Success Rate
              </h3>
            </div>
            <div hlmCardContent>
              <div class="text-2xl font-bold">
                {{ report()!.successRate | number: '1.1-1' }}%
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                Payment success
              </p>
            </div>
          </div>
        </div>

        <!-- Charts and Lists -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Contributions Over Time Chart -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Contributions Over Time</h3>
              <p hlmCardDescription>
                Daily contribution trends
              </p>
            </div>
            <div hlmCardContent>
              <nyots-contribution-chart [data]="report()!.timeSeriesData" />
            </div>
          </div>

          <!-- Top Projects -->
          <div hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Top Projects</h3>
              <p hlmCardDescription>
                Projects with highest contributions
              </p>
            </div>
            <div hlmCardContent>
              <nyots-top-projects-list [projects]="report()!.topProjects" />
            </div>
          </div>
        </div>

        <!-- Top Contributors -->
        <div hlmCard>
          <div hlmCardHeader>
            <h3 hlmCardTitle>Top Contributors</h3>
            <p hlmCardDescription>
              Users with highest contribution amounts
            </p>
          </div>
          <div hlmCardContent>
            <nyots-top-contributors-list [contributors]="report()!.topContributors" />
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ContributionDashboardComponent implements OnInit {
  private contributionService = inject(ContributionService);

  // State signals
  report = signal<IContributionReport | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadReport();
  }

  /**
   * Load contribution report data
   * Uses SUMMARY report type to get all dashboard statistics
   */
  async loadReport() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const reportData = await this.contributionService.getReport(
        IReportType.Summary
      );

      if (reportData) {
        this.report.set(reportData);
      } else {
        this.error.set('Failed to load contribution report');
      }
    } catch (err) {
      console.error('Error loading contribution report:', err);
      this.error.set(
        'Failed to load contribution report. Please try again later.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
