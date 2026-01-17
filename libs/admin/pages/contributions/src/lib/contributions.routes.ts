import { Routes } from '@angular/router';
import { authGuard } from '@nyots/data-source/auth';
import { ContributionDashboardComponent } from './pages/dashboard/contribution-dashboard.component';
import { ContributionListComponent } from './pages/list/contribution-list.component';
import { ContributionFormComponent } from './pages/form/contribution-form.component';
import { ContributionDetailComponent } from './pages/detail/contribution-detail.component';
import { PendingContributionsComponent } from './pages/pending/pending-contributions.component';
import { ContributionReportsComponent } from './pages/reports/contribution-reports.component';

/**
 * Routes for the contributions management module.
 * All routes are protected by the auth guard for admin access.
 */
export const contributionsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // Dashboard route (default)
      {
        path: '',
        component: ContributionDashboardComponent,
      },
      // Dashboard route (explicit)
      {
        path: 'dashboard',
        component: ContributionDashboardComponent,
      },
      // List all contributions
      {
        path: 'list',
        component: ContributionListComponent,
      },
      // Create new contribution
      {
        path: 'create',
        component: ContributionFormComponent,
      },
      // Pending contributions (uses list component with filter)
      {
        path: 'pending',
        component: PendingContributionsComponent,
      },
      // Reports route
      {
        path: 'reports',
        component: ContributionReportsComponent,
      },
      // Refunds route (placeholder - will be implemented later)
      {
        path: 'refunds',
        component: ContributionListComponent,
        data: { filter: { paymentStatus: 'REFUNDED' } },
      },
      // Transaction logs route (placeholder - will be implemented in task 25)
      {
        path: 'transactions',
        component: ContributionListComponent, // Temporary - will be replaced with TransactionLogsComponent
        data: { isTransactionsView: true },
      },
      // View contribution detail (must be last to avoid conflicts)
      {
        path: ':id',
        component: ContributionDetailComponent,
      },
    ],
  },
];
