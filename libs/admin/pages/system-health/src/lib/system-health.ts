import { Component, inject, OnInit } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideXCircle,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

// 1. Define the data structure for a health check
export interface HealthCheck {
  name: string;
  status: 'OK' | 'Error' | 'Degraded';
  details?: string;
  responseTime: number; // in ms
}

// 2. Mock HealthCheckService (in a real app, this would be in its own file and fetch data from an API)
class SystemHealthService {
  getHealthChecks(): Observable<HealthCheck[]> {
    const mockData: HealthCheck[] = [
      { name: 'Backend API', status: 'OK', responseTime: 120 },
      { name: 'Database', status: 'OK', responseTime: 45 },
      {
        name: 'Cache Service',
        status: 'Degraded',
        details: 'High memory usage',
        responseTime: 350,
      },
      { name: 'Background Jobs', status: 'OK', responseTime: 80 },
      {
        name: 'Email Service',
        status: 'Error',
        details: 'SMTP server not responding',
        responseTime: 5000,
      },
    ];
    return of(mockData).pipe(delay(500)); // Simulate network delay
  }
}

@Component({
  standalone: true,
  imports: [
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmIcon,
    NgIconComponent,
    AsyncPipe,
  ],
  providers: [
    // Provide the service here. In a larger app, you'd provide this at the root or route level.
    SystemHealthService,
    provideIcons({ lucideCheckCircle, lucideXCircle, lucideAlertTriangle }),
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">System Health</h1>
      @if (healthChecks$ | async; as healthChecks) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (check of healthChecks; track check.name) {
            <div hlmCard>
              <div
                hlmCardHeader
                class="flex flex-row items-center justify-between pb-2"
              >
                <h3 hlmCardTitle class="text-lg">{{ check.name }}</h3>
                <ng-icon
                  hlmIcon
                  [name]="getStatusIcon(check.status)"
                  [class]="getStatusColor(check.status)"
                  size="lg"
                />
              </div>
              <div hlmCardContent>
                <p class="text-sm text-muted-foreground">
                  Status:
                  <span
                    class="font-semibold"
                    [class]="getStatusColor(check.status)"
                    >{{ check.status }}</span
                  >
                </p>
                <p class="text-sm text-muted-foreground">
                  Response Time: {{ check.responseTime }}ms
                </p>
                @if (check.details) {
                  <p class="text-sm text-destructive mt-2">
                    {{ check.details }}
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
export class SystemHealth implements OnInit {
  private healthService = inject(SystemHealthService);
  public healthChecks$!: Observable<HealthCheck[]>;

  ngOnInit() {
    this.healthChecks$ = this.healthService.getHealthChecks();
  }

  getStatusIcon(status: HealthCheck['status']): string {
    switch (status) {
      case 'OK':
        return 'lucideCheckCircle';
      case 'Error':
        return 'lucideXCircle';
      case 'Degraded':
        return 'lucideAlertTriangle';
    }
  }

  getStatusColor(status: HealthCheck['status']): string {
    switch (status) {
      case 'OK':
        return 'text-green-500';
      case 'Error':
        return 'text-red-500';
      case 'Degraded':
        return 'text-yellow-500';
    }
  }
}
