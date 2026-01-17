import { Component, Input, OnInit, OnChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardService } from '@nyots/data-source/dashboard';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmSpinner } from '@nyots/ui/spinner';

@Component({
  selector: 'app-contribution-trend-chart',
  imports: [
    CommonModule,
    NgxChartsModule,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
    HlmSpinner,
  ],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Contribution Trends</h3>
        <p hlmCardDescription>Daily contribution amounts over time</p>
      </div>
      <div hlmCardContent>
        @if (loading()) {
          <div class="flex items-center justify-center h-64">
            <span hlmSpinner></span>
          </div>
        } @else {
          <ngx-charts-area-chart
            [view]="[600, 300]"
            [results]="chartData()"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            xAxisLabel="Date"
            yAxisLabel="Amount ($)"
            [timeline]="false"
            [gradient]="true"
          >
          </ngx-charts-area-chart>
        }
      </div>
    </div>
  `,
})
export class ContributionTrendChartComponent implements OnInit, OnChanges {
  @Input() dateRange: { startDate?: Date; endDate?: Date } = {};

  private dashboardService = inject(DashboardService);
  
  loading = signal(true);
  chartData = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    const endDate = this.dateRange.endDate || new Date();
    const startDate = this.dateRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    this.dashboardService.getContributionTrends(startDate, endDate, 'day').subscribe({
      next: (data) => {
        if (!data) {
          this.loading.set(false);
          return;
        }
        const formattedData = [
          {
            name: 'Contributions',
            series: data.map((item: any) => ({
              name: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              value: parseFloat(item.amount),
            })),
          },
        ];
        this.chartData.set(formattedData);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading contribution trends:', error);
        this.loading.set(false);
      },
    });
  }
}
