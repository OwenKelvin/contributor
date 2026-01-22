import { Component, input, output, EventEmitter, OnInit, OnChanges, inject, signal } from '@angular/core';
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
  selector: 'nyots-top-projects-chart',
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
        <h3 hlmCardTitle>Top Projects by Contributions</h3>
        <p hlmCardDescription>Highest earning projects</p>
      </div>
      <div hlmCardContent>
        @if (loading()) {
          <div class="flex items-center justify-center h-64">
            <hlm-spinner></hlm-spinner>
          </div>
        } @else {
          <ngx-charts-bar-horizontal
            [view]="[600, 300]"
            [results]="chartData()"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            xAxisLabel="Total Amount ($)"
            yAxisLabel="Project"
            [gradient]="false"
          >
          </ngx-charts-bar-horizontal>
        }
      </div>
    </div>
  `,
})
export class TopProjectsChartComponent implements OnInit, OnChanges {
  dateRange = input<{ startDate?: Date; endDate?: Date }>({});

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

    this.dashboardService.getTopProjects(10, this.dateRange()).subscribe({
      next: (data) => {
        if (!data) {
          this.loading.set(false);
          return;
        }
        const formattedData = data.map((item: any) => ({
          name: this.truncateTitle(item.project.title),
          value: parseFloat(item.totalAmount),
        }));
        this.chartData.set(formattedData);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading top projects:', error);
        this.loading.set(false);
      },
    });
  }

  truncateTitle(title: string, maxLength = 30): string {
    return title.length > maxLength
      ? title.substring(0, maxLength) + '...'
      : title;
  }
}
