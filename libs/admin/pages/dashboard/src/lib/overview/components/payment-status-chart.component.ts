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
  selector: 'nyots-payment-status-chart',
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
        <h3 hlmCardTitle>Payment Status Overview</h3>
        <p hlmCardDescription>Contribution payment status breakdown</p>
      </div>
      <div hlmCardContent>
        @if (chartData.length > 0) {
          <ngx-charts-bar-vertical
            [view]="[600, 300]"
            [results]="chartData"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            xAxisLabel="Status"
            yAxisLabel="Amount ($)"
            [gradient]="false"
          >
          </ngx-charts-bar-vertical>
        } @else {
          <div class="flex items-center justify-center h-64 text-muted-foreground">
            No payment data available
          </div>
        }
      </div>
    </div>
  `,
})
export class PaymentStatusChartComponent implements OnChanges {
  @Input() data: Array<{ status: string; count: number; amount: number }> = [];

  chartData: any[] = [];

  ngOnChanges() {
    this.chartData = this.data.map((item) => ({
      name: this.formatStatus(item.status),
      value: parseFloat(item.amount.toString()),
    }));
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}
