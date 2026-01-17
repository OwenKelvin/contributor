import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucideFolderOpen,
  lucideDollarSign,
  lucideTrendingUp,
  lucideTrendingDown,
  lucideArrowUp,
  lucideArrowDown,
} from '@ng-icons/lucide';
import { HlmIcon } from '@nyots/ui/icon';
import {
  HlmCard,
  HlmCardContent,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule, NgIcon, HlmIcon, HlmCard, HlmCardHeader, HlmCardTitle, HlmCardContent],
  template: `
    <div hlmCard>
      <div hlmCardHeader class="flex flex-row items-center justify-between pb-2">
        <h3 hlmCardTitle class="text-sm font-medium text-muted-foreground">
          {{ title }}
        </h3>
        <ng-icon [name]="getIconName()" hlm size="sm" class="text-muted-foreground" />
      </div>
      <div hlmCardContent>
        <div class="text-2xl font-bold">{{ value }}</div>
        @if (trend) {
          <p class="text-xs flex items-center gap-1 mt-1"
             [class.text-green-600]="trendDirection === 'up'"
             [class.text-red-600]="trendDirection === 'down'">
            <ng-icon
              [name]="trendDirection === 'up' ? 'lucideArrowUp' : 'lucideArrowDown'"
              hlm
              size="xs"
            />
            <span>{{ trend }} from last period</span>
          </p>
        }
      </div>
    </div>
  `,
  providers: [
    provideIcons({
      lucideUsers,
      lucideFolderOpen,
      lucideDollarSign,
      lucideTrendingUp,
      lucideTrendingDown,
      lucideArrowUp,
      lucideArrowDown,
    }),
  ],
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value: string | number = 0;
  @Input() icon: 'users' | 'folder' | 'dollar' | 'trending' = 'users';
  @Input() trend?: string;
  @Input() trendDirection: 'up' | 'down' = 'up';

  getIconName(): string {
    const iconMap = {
      users: 'lucideUsers',
      folder: 'lucideFolderOpen',
      dollar: 'lucideDollarSign',
      trending: 'lucideTrendingUp',
    };
    return iconMap[this.icon];
  }
}
