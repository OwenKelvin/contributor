import { ProjectContributionSummary } from './project-contribution-summary.type';
import { UserContributionSummary } from './user-contribution-summary.type';
import { TimeSeriesPoint } from './time-series-point.type';

export class ContributionReport {
  totalContributions: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  paidCount: number;
  paidAmount: number;
  failedCount: number;
  failedAmount: number;
  refundedCount: number;
  refundedAmount: number;
  successRate: number;
  topProjects: ProjectContributionSummary[];
  topContributors: UserContributionSummary[];
  timeSeriesData: TimeSeriesPoint[];
}
