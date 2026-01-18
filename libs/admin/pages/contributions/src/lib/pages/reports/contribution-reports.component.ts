import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import {
  IReportType,
  IReportFilter,
  IContributionReport,
  IPaymentStatus,
} from '@nyots/data-source';
import { ContributionService } from '@nyots/data-source/contributions';
import { ProjectService } from '@nyots/data-source/projects';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideDownload,
  lucideRefreshCw,
  lucideFileText,
  lucideBarChart3,
} from '@ng-icons/lucide';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmLabel } from '@nyots/ui/label';
import { HlmInput } from '@nyots/ui/input';
import {
  HlmSelect,
  HlmSelectContent,
  HlmSelectOption,
  HlmSelectTrigger,
  HlmSelectValue,
} from '@nyots/ui/select';
import { ContributionChartComponent } from '../../components/contribution-chart/contribution-chart.component';
import { TopProjectsListComponent } from '../../components/top-projects-list/top-projects-list.component';
import { TopContributorsListComponent } from '../../components/top-contributors-list/top-contributors-list.component';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'nyots-contribution-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmButton,
    HlmIcon,
    NgIcon,
    HlmSpinner,
    HlmLabel,
    HlmInput,
    HlmSelect,
    HlmSelectContent,
    HlmSelectOption,
    HlmSelectTrigger,
    HlmSelectValue,
    ContributionChartComponent,
    TopProjectsListComponent,
    TopContributorsListComponent,
  ],
  providers: [
    provideIcons({
      lucideDownload,
      lucideRefreshCw,
      lucideFileText,
      lucideBarChart3,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Contribution Reports</h1>
        <p class="text-muted-foreground">
          Generate and analyze contribution reports with various filters
        </p>
      </div>

      <!-- Filters Card -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Report Filters</h3>
          <p hlmCardDescription>Configure report parameters and filters</p>
        </div>
        <div hlmCardContent>
          <form [formGroup]="filterForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Report Type -->
              <div class="space-y-2">
                <label hlmLabel for="reportType">Report Type</label>
                <hlm-select
                  id="reportType"
                  formControlName="reportType"
                  class="w-full"
                >
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value />
                  </hlm-select-trigger>
                  <hlm-option [value]="$any(ReportType.Summary)">Summary Report</hlm-option>
                  <hlm-option [value]="$any(ReportType.ByProject)">By Project</hlm-option>
                  <hlm-option [value]="$any(ReportType.ByUser)">By User</hlm-option>
                  <hlm-option [value]="$any(ReportType.TimeSeries)">Time Series</hlm-option>
                </hlm-select>
              </div>

              <!-- Start Date -->
              <div class="space-y-2">
                <label hlmLabel for="startDate">Start Date</label>
                <input
                  hlmInput
                  type="date"
                  id="startDate"
                  formControlName="startDate"
                  class="w-full"
                />
              </div>

              <!-- End Date -->
              <div class="space-y-2">
                <label hlmLabel for="endDate">End Date</label>
                <input
                  hlmInput
                  type="date"
                  id="endDate"
                  formControlName="endDate"
                  class="w-full"
                />
              </div>

              <!-- Project Filter -->
              <div class="space-y-2">
                <label hlmLabel for="projectId">Project (Optional)</label>
                <hlm-select
                  id="projectId"
                  formControlName="projectId"
                  class="w-full"
                >
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value />
                  </hlm-select-trigger>
                  <hlm-option [value]="">All Projects</hlm-option>
                  @for (project of projects(); track project.id) {
                    <hlm-option [value]="project.id">{{ project.title }}</hlm-option>
                  }
                </hlm-select>
              </div>

              <!-- Status Filter -->
              <div class="space-y-2">
                <label hlmLabel for="status">Status (Optional)</label>
                <hlm-select
                  id="status"
                  formControlName="status"
                  class="w-full"
                >
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-option [value]="">All Statuses</hlm-option>
                    <hlm-option [value]="$any(PaymentStatus.Pending)">Pending</hlm-option>
                    <hlm-option [value]="$any(PaymentStatus.Paid)">Paid</hlm-option>
                    <hlm-option [value]="$any(PaymentStatus.Failed)">Failed</hlm-option>
                    <hlm-option [value]="$any(PaymentStatus.Refunded)">Refunded</hlm-option>
                  </hlm-select-content>
                </hlm-select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <button
                hlmBtn
                type="button"
                variant="default"
                (click)="generateReport()"
                [disabled]="isLoading() || filterForm.invalid"
              >
                <ng-icon
                  hlmIcon
                  name="lucideBarChart3"
                  size="base"
                  class="mr-2"
                />
                Generate Report
              </button>
              <button
                hlmBtn
                type="button"
                variant="outline"
                (click)="resetFilters()"
                [disabled]="isLoading()"
              >
                <ng-icon
                  hlmIcon
                  name="lucideRefreshCw"
                  size="base"
                  class="mr-2"
                />
                Reset
              </button>
              @if (report()) {
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  (click)="exportToCSV()"
                  [disabled]="isLoading()"
                >
                  <ng-icon
                    hlmIcon
                    name="lucideDownload"
                    size="base"
                    class="mr-2"
                  />
                  Export CSV
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  (click)="exportToPDF()"
                  [disabled]="isLoading()"
                >
                  <ng-icon
                    hlmIcon
                    name="lucideFileText"
                    size="base"
                    class="mr-2"
                  />
                  Export PDF
                </button>
              }
            </div>
          </form>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-2">
            <hlm-spinner />
            <p class="text-sm text-muted-foreground">Generating report...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p class="text-sm text-destructive">{{ error() }}</p>
        </div>
      }

      <!-- Report Results -->
      @if (report() && !isLoading()) {
        <div class="space-y-6">
          <!-- Summary Report -->
          @if (currentReportType() === ReportType.Summary) {
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <!-- Total Contributions Card -->
              <div hlmCard>
                <div hlmCardHeader class="pb-2">
                  <h3
                    hlmCardTitle
                    class="text-sm font-medium text-muted-foreground"
                  >
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
                  <h3
                    hlmCardTitle
                    class="text-sm font-medium text-muted-foreground"
                  >
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
                  <h3
                    hlmCardTitle
                    class="text-sm font-medium text-muted-foreground"
                  >
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
                  <h3
                    hlmCardTitle
                    class="text-sm font-medium text-muted-foreground"
                  >
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
                  <p hlmCardDescription>Daily contribution trends</p>
                </div>
                <div hlmCardContent>
                  <nyots-contribution-chart [data]="report()!.timeSeriesData" />
                </div>
              </div>

              <!-- Top Projects -->
              <div hlmCard>
                <div hlmCardHeader>
                  <h3 hlmCardTitle>Top Projects</h3>
                  <p hlmCardDescription>Projects with highest contributions</p>
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
                <nyots-top-contributors-list
                  [contributors]="report()!.topContributors"
                />
              </div>
            </div>
          }

          <!-- By Project Report -->
          @if (currentReportType() === ReportType.ByProject) {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Contributions by Project</h3>
                <p hlmCardDescription>Total contributions grouped by project</p>
              </div>
              <div hlmCardContent>
                <nyots-top-projects-list [projects]="report()!.topProjects" />
              </div>
            </div>
          }

          <!-- By User Report -->
          @if (currentReportType() === ReportType.ByUser) {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Contributions by User</h3>
                <p hlmCardDescription>
                  Total contributions grouped by contributor
                </p>
              </div>
              <div hlmCardContent>
                <nyots-top-contributors-list
                  [contributors]="report()!.topContributors"
                />
              </div>
            </div>
          }

          <!-- Time Series Report -->
          @if (currentReportType() === ReportType.TimeSeries) {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Contributions Over Time</h3>
                <p hlmCardDescription>Time-based contribution analysis</p>
              </div>
              <div hlmCardContent>
                <nyots-contribution-chart [data]="report()!.timeSeriesData" />
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!report() && !isLoading() && !error()) {
        <div
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <ng-icon
            hlmIcon
            name="lucideBarChart3"
            size="xl"
            class="text-muted-foreground mb-4"
          />
          <p class="text-lg font-medium">No Report Generated</p>
          <p class="text-sm text-muted-foreground mt-1">
            Configure filters and click "Generate Report" to view contribution
            analytics
          </p>
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
export class ContributionReportsComponent {
  private readonly contributionService = inject(ContributionService);
  private readonly projectService = inject(ProjectService);
  private readonly fb = inject(FormBuilder);

  // Expose enums to template
  readonly ReportType = IReportType;
  readonly PaymentStatus = IPaymentStatus;

  // State signals
  report = signal<IContributionReport | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  projects$ = this.projectService.getAllProjects({}).pipe(
    map((result) => {
      if (result?.edges) {
        return result.edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
        }));
      }
      return [];
    }),
  );
  projects = toSignal(this.projects$, {initialValue: []})

  // Form
  filterForm = this.fb.group({
    reportType: [IReportType.Summary, Validators.required],
    startDate: [''],
    endDate: [''],
    projectId: [''],
    status: [''],
  });

  // Computed
  currentReportType = computed(
    () => this.filterForm.value.reportType as IReportType,
  );

  /**
   * Generate report based on current filters
   */
  async generateReport() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const formValue = this.filterForm.value;

      // Build filter object
      const filter: IReportFilter = {};

      if (formValue.startDate) {
        filter.startDate = new Date(formValue.startDate).toISOString();
      }

      if (formValue.endDate) {
        filter.endDate = new Date(formValue.endDate).toISOString();
      }

      if (formValue.projectId) {
        filter.projectId = formValue.projectId;
      }

      // Note: Status filter is not part of IReportFilter in the current schema
      // If needed, it should be added to the backend schema

      const reportType = formValue.reportType as IReportType;
      const reportData = await this.contributionService.getReport(
        reportType,
        filter,
      );

      if (reportData) {
        this.report.set(reportData);
        toast.success('Report generated successfully');
      } else {
        this.error.set('Failed to generate report');
        toast.error('Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      this.error.set('Failed to generate report. Please try again later.');
      toast.error('Failed to generate report');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Reset filters to default values
   */
  resetFilters() {
    this.filterForm.reset({
      reportType: IReportType.Summary,
      startDate: '',
      endDate: '',
      projectId: '',
      status: '',
    });
    this.report.set(null);
    this.error.set(null);
  }

  /**
   * Export report data to CSV
   */
  exportToCSV() {
    const reportData = this.report();
    if (!reportData) {
      toast.error('No report data to export');
      return;
    }

    try {
      const reportType = this.currentReportType();
      let csvContent = '';
      let filename = '';

      switch (reportType) {
        case IReportType.Summary:
          csvContent = this.generateSummaryCSV(reportData);
          filename = 'contribution-summary-report.csv';
          break;
        case IReportType.ByProject:
          csvContent = this.generateByProjectCSV(reportData);
          filename = 'contributions-by-project.csv';
          break;
        case IReportType.ByUser:
          csvContent = this.generateByUserCSV(reportData);
          filename = 'contributions-by-user.csv';
          break;
        case IReportType.TimeSeries:
          csvContent = this.generateTimeSeriesCSV(reportData);
          filename = 'contributions-time-series.csv';
          break;
      }

      this.downloadFile(csvContent, filename, 'text/csv');
      toast.success('Report exported to CSV');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export report');
    }
  }

  /**
   * Export report data to PDF
   */
  exportToPDF() {
    const reportData = this.report();
    if (!reportData) {
      toast.error('No report data to export');
      return;
    }

    // TODO: Implement PDF export using a library like jsPDF
    // For now, show a message that this feature is coming soon
    toast.info('PDF export feature coming soon');
  }

  /**
   * Generate CSV content for summary report
   */
  private generateSummaryCSV(report: IContributionReport): string {
    const lines: string[] = [];

    // Header
    lines.push('Contribution Summary Report');
    lines.push('');

    // Summary statistics
    lines.push('Metric,Count,Amount');
    lines.push(`Total,${report.totalContributions},${report.totalAmount}`);
    lines.push(`Pending,${report.pendingCount},${report.pendingAmount}`);
    lines.push(`Paid,${report.paidCount},${report.paidAmount}`);
    lines.push(`Failed,${report.failedCount},${report.failedAmount}`);
    lines.push(`Refunded,${report.refundedCount},${report.refundedAmount}`);
    lines.push(`Success Rate,${report.successRate}%,`);
    lines.push('');

    // Top projects
    if (report.topProjects && report.topProjects.length > 0) {
      lines.push('Top Projects');
      lines.push('Project,Total Amount,Contribution Count');
      report.topProjects.forEach((project) => {
        lines.push(
          `"${project.projectTitle}",${project.totalAmount},${project.contributionCount}`,
        );
      });
      lines.push('');
    }

    // Top contributors
    if (report.topContributors && report.topContributors.length > 0) {
      lines.push('Top Contributors');
      lines.push('Contributor,Total Amount,Contribution Count');
      report.topContributors.forEach((contributor) => {
        lines.push(
          `"${contributor.userName}",${contributor.totalAmount},${contributor.contributionCount}`,
        );
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate CSV content for by-project report
   */
  private generateByProjectCSV(report: IContributionReport): string {
    const lines: string[] = [];

    lines.push('Contributions by Project');
    lines.push('');
    lines.push('Project,Total Amount,Contribution Count');

    if (report.topProjects && report.topProjects.length > 0) {
      report.topProjects.forEach((project) => {
        lines.push(
          `"${project.projectTitle}",${project.totalAmount},${project.contributionCount}`,
        );
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate CSV content for by-user report
   */
  private generateByUserCSV(report: IContributionReport): string {
    const lines: string[] = [];

    lines.push('Contributions by User');
    lines.push('');
    lines.push('Contributor,Total Amount,Contribution Count');

    if (report.topContributors && report.topContributors.length > 0) {
      report.topContributors.forEach((contributor) => {
        lines.push(
          `"${contributor.userName}",${contributor.totalAmount},${contributor.contributionCount}`,
        );
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate CSV content for time series report
   */
  private generateTimeSeriesCSV(report: IContributionReport): string {
    const lines: string[] = [];

    lines.push('Contributions Time Series');
    lines.push('');
    lines.push('Date,Total Amount,Contribution Count');

    if (report.timeSeriesData && report.timeSeriesData.length > 0) {
      report.timeSeriesData.forEach((point) => {
        lines.push(
          `${point.date},${point.totalAmount},${point.contributionCount}`,
        );
      });
    }

    return lines.join('\n');
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
