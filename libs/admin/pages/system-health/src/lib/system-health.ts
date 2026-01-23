import { Component, inject } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideXCircle,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import { HealthCheckService } from '@nyots/data-source/health-check';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({ lucideCheckCircle, lucideXCircle, lucideAlertTriangle }),
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">System Health</h1>
      @if (healthChecks()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (check of healthChecks(); track check?.name) {
            <div hlmCard>
              <div
                hlmCardHeader
                class="flex flex-row items-center justify-between pb-2"
              >
                <h3 hlmCardTitle class="text-lg">{{ check?.name }}</h3>
                <ng-icon
                  hlmIcon
                  [name]="getStatusIcon(check?.status ?? '')"
                  [class]="getStatusColor(check?.status ?? '')"
                  size="lg"
                />
              </div>
              <div hlmCardContent>
                <p class="text-sm text-muted-foreground">
                  Status:
                  <span
                    class="font-semibold"
                    [class]="getStatusColor(check?.status ?? '')"
                    >{{ check?.status }}</span
                  >
                </p>
                <p class="text-sm text-muted-foreground">
                  Response Time: {{ check?.responseTime }}ms
                </p>
                @if (check?.details) {
                  <p class="text-sm text-destructive mt-2">
                    {{ check?.details }}
                  </p>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <p>Loading system health...</p>
      }
    </div>
  `,
})
export class SystemHealth {
  private healthService = inject(HealthCheckService);
  public healthChecks = toSignal(this.healthService.getHealthChecks());


  getStatusIcon(status: string): string {
    switch (status) {
      case 'OK':
        return 'lucideCheckCircle';
      case 'Error':
        return 'lucideXCircle';
      case 'Degraded':
        return 'lucideAlertTriangle';
      default:
        return 'lucideAlertTriangle'; // Default for unknown status
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OK':
        return 'text-green-500';
      case 'Error':
        return 'text-red-500';
      case 'Degraded':
        return 'text-yellow-500';
      default:
        return 'text-gray-500'; // Default for unknown status
    }
  }
}
