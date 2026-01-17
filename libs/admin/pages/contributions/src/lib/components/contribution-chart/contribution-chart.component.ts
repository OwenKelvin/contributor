import { Component, input, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ITimeSeriesPoint } from '@nyots/data-source';

/**
 * Contribution Chart Component
 *
 * Displays time series data as a line chart with tooltips.
 * Uses SVG for rendering to avoid external chart library dependencies.
 *
 * Requirements: 11.5
 */
@Component({
  selector: 'nyots-contribution-chart',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    @if (data() && data()!.length > 0) {
      <div class="relative w-full" style="height: 300px;">
        <svg
          class="w-full h-full"
          [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight"
          preserveAspectRatio="none"
        >
          <!-- Grid lines -->
          <g class="grid-lines" stroke="#e5e7eb" stroke-width="1">
            @for (line of gridLines(); track $index) {
              <line
                [attr.x1]="0"
                [attr.y1]="line"
                [attr.x2]="chartWidth"
                [attr.y2]="line"
                stroke-dasharray="4,4"
              />
            }
          </g>

          <!-- Area fill -->
          <path [attr.d]="areaPath()" fill="url(#gradient)" opacity="0.2" />

          <!-- Line path -->
          <path
            [attr.d]="linePath()"
            fill="none"
            stroke="#10b981"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Data points -->
          @for (point of chartPoints(); track $index) {
            <circle
              [attr.cx]="point.x"
              [attr.cy]="point.y"
              r="4"
              fill="#10b981"
              stroke="white"
              stroke-width="2"
              class="cursor-pointer hover:r-6 transition-all"
              (mouseenter)="showTooltip($index, $event)"
              (mouseleave)="hideTooltip()"
            />
          }

          <!-- Gradient definition -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Tooltip -->
        @if (tooltipVisible()) {
          <div
            class="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10"
            [style.left.px]="tooltipX()"
            [style.top.px]="tooltipY()"
          >
            <div class="font-semibold">{{ tooltipData()?.date }}</div>
            <div>Amount: {{ tooltipData()?.totalAmount | currency }}</div>
            <div>Count: {{ tooltipData()?.contributionCount }}</div>
          </div>
        }

        <!-- X-axis labels -->
        <div class="flex justify-between mt-2 text-xs text-muted-foreground">
          @if (axisLabels(); as labels) {
            <span>{{ labels.first | date: 'MMM d' }}</span>
            @if (labels.middle) {
              <span>{{ labels.middle | date: 'MMM d' }}</span>
            }
            @if (labels.last) {
              <span>{{ labels.last | date: 'MMM d' }}</span>
            }
          }
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-64 text-muted-foreground">
        <p>No data available</p>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ContributionChartComponent {
  // Input
  data = input.required<ITimeSeriesPoint[]>();

  // Chart dimensions
  readonly chartWidth = 800;
  readonly chartHeight = 250;
  readonly padding = 20;

  // Tooltip state
  tooltipVisible = computed(() => this.tooltipIndex() !== null);
  tooltipIndex = computed(() => this._tooltipIndex);
  tooltipData = computed(() => {
    const index = this._tooltipIndex;
    return index !== null ? this.data()[index] : null;
  });
  tooltipX = computed(() => this._tooltipX);
  tooltipY = computed(() => this._tooltipY);

  private _tooltipIndex: number | null = null;
  private _tooltipX = 0;
  private _tooltipY = 0;

  /**
   * Calculate axis labels (first, middle, last dates)
   */
  axisLabels = computed(() => {
    const dataPoints = this.data();
    if (!dataPoints || dataPoints.length === 0) return null;

    return {
      first: dataPoints[0].date,
      middle: dataPoints.length > 1 ? dataPoints[Math.floor(dataPoints.length / 2)].date : null,
      last: dataPoints.length > 1 ? dataPoints[dataPoints.length - 1].date : null,
    };
  });

  /**
   * Calculate chart points with proper scaling
   */
  chartPoints = computed(() => {
    const dataPoints = this.data();
    if (!dataPoints || dataPoints.length === 0) return [];

    const maxAmount = Math.max(...dataPoints.map((d) => d.totalAmount));
    const minAmount = Math.min(...dataPoints.map((d) => d.totalAmount));
    const range = maxAmount - minAmount || 1;

    return dataPoints.map((point, index) => {
      const x =
        this.padding +
        (index / (dataPoints.length - 1 || 1)) *
        (this.chartWidth - 2 * this.padding);
      const y =
        this.chartHeight -
        this.padding -
        ((point.totalAmount - minAmount) / range) *
        (this.chartHeight - 2 * this.padding);

      return { x, y, data: point };
    });
  });

  /**
   * Generate SVG path for the line
   */
  linePath = computed(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  });

  /**
   * Generate SVG path for the area fill
   */
  areaPath = computed(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${this.chartHeight - this.padding}`;
    path += ` L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    path += ` L ${points[points.length - 1].x} ${
      this.chartHeight - this.padding
    }`;
    path += ' Z';
    return path;
  });

  /**
   * Generate horizontal grid lines
   */
  gridLines = computed(() => {
    const lines: number[] = [];
    const numLines = 5;
    for (let i = 0; i <= numLines; i++) {
      const y =
        this.padding + (i / numLines) * (this.chartHeight - 2 * this.padding);
      lines.push(y);
    }
    return lines;
  });

  /**
   * Show tooltip on hover
   */
  showTooltip(index: number, event: MouseEvent) {
    this._tooltipIndex = index;
    const target = event.target as SVGElement;
    const rect = target.getBoundingClientRect();
    const parentRect = target.closest('div')?.getBoundingClientRect();

    if (parentRect) {
      this._tooltipX = rect.left - parentRect.left + rect.width / 2 - 50;
      this._tooltipY = rect.top - parentRect.top - 60;
    }
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this._tooltipIndex = null;
  }
}
