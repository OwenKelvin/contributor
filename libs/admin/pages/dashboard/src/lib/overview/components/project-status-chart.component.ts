import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';

@Component({
  selector: 'app-project-status-chart',
  imports: [
    CommonModule,
    NgxChartsModule,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
  ],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Project Status Distribution</h3>
        <p hlmCardDescription>Breakdown of projects by status</p>
      </div>
      <div hlmCardContent>
        @if (chartData.length > 0) {
          <ngx-charts-pie-chart
            [view]="[600, 300]"
            [results]="chartData"
            [legend]="true"
            [labels]="true"
            [doughnut]="true"
            [gradient]="false"
          >
          </ngx-charts-pie-chart>
        } @else {
          <div class="flex items-center justify-center h-64 text-muted-foreground">
            No project data available
          </div>
        }
      </div>
    </div>
  `,
})
export class ProjectStatusChartComponent implements OnChanges {
  @Input() data: Array<{ status: string; count: number }> = [];

  chartData: any[] = [];

  ngOnChanges() {
    this.chartData = this.data.map((item) => ({
      name: this.formatStatus(item.status),
      value: item.count,
    }));
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}
