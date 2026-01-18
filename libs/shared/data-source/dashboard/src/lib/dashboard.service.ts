import { Injectable, inject } from '@angular/core';
import { Observable, map, from } from 'rxjs';
import {
  GetDashboardStatsGQL,
  GetContributionTrendsGQL,
  GetTopProjectsGQL,
  GetRecentContributionsGQL,
  GetRecentProjectsGQL,
  GetRecentUsersGQL,
} from './dashboard.generated';

export interface DashboardDateRange {
  startDate?: Date;
  endDate?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private getDashboardStatsGQL = inject(GetDashboardStatsGQL);
  private getContributionTrendsGQL = inject(GetContributionTrendsGQL);
  private getTopProjectsGQL = inject(GetTopProjectsGQL);
  private getRecentContributionsGQL = inject(GetRecentContributionsGQL);
  private getRecentProjectsGQL = inject(GetRecentProjectsGQL);
  private getRecentUsersGQL = inject(GetRecentUsersGQL);

  getDashboardStats(dateRange?: DashboardDateRange) {
    return from(
      this.getDashboardStatsGQL.fetch({
        variables: {
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
        },
      })
    ).pipe(map((result) => result.data?.dashboardStats));
  }

  getContributionTrends(
    startDate: Date,
    endDate: Date,
    groupBy = 'day'
  ) {
    return from(
      this.getContributionTrendsGQL.fetch({
        variables: {
          startDate,
          endDate,
          groupBy,
        },
      })
    ).pipe(map((result) => result.data?.contributionTrends));
  }

  getTopProjects(limit = 10, dateRange?: DashboardDateRange) {
    return from(
      this.getTopProjectsGQL.fetch({
        variables: {
          limit,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
        },
      })
    ).pipe(map((result) => result.data?.topProjects));
  }

  getRecentContributions(limit = 10) {
    return from(
      this.getRecentContributionsGQL.fetch({
        variables: { limit },
      })
    ).pipe(
      map((result) => result.data?.getContributions?.edges?.map((e: any) => e.node) || [])
    );
  }

  getRecentProjects(limit = 5) {
    return from(
      this.getRecentProjectsGQL.fetch({
        variables: { limit },
      })
    ).pipe(
      map((result) => result.data?.getAllProjects?.edges?.map((e: any) => e.node) || [])
    );
  }

  getRecentUsers(limit = 5) {
    return from(
      this.getRecentUsersGQL.fetch({
        variables: { limit },
      })
    ).pipe(
      map((result) => result.data?.getAllUsers?.edges?.map((e: any) => e.node) || [])
    );
  }

  exportDashboardData(dateRange?: DashboardDateRange): Observable<Blob> {
    // This will be implemented to export dashboard data as CSV/Excel
    return new Observable((observer) => {
      // Placeholder for export functionality
      observer.next(new Blob(['Dashboard data export'], { type: 'text/csv' }));
      observer.complete();
    });
  }
}
