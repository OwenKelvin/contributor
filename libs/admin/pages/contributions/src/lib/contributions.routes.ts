import { Routes } from '@angular/router';
import { authGuard } from '@nyots/data-source/auth';
import { ContributionsLayoutComponent } from './layout/contributions-layout.component';
import { ContributionDashboardComponent } from './pages/dashboard/contribution-dashboard.component';
import { ContributionListComponent } from './pages/list/contribution-list.component';
import { ContributionFormComponent } from './pages/form/contribution-form.component';
import { ContributionDetailComponent } from './pages/detail/contribution-detail.component';
import { PendingContributionsComponent } from './pages/pending/pending-contributions.component';
import { ContributionReportsComponent } from './pages/reports/contribution-reports.component';
import { TransactionLogsComponent } from './pages/transactions/transaction-logs.component';

/**
 * Routes for the contributions management module.
 * All routes are protected by the auth guard for admin access.
 */
export const contributionsRoutes: Routes = [
  {
    path: '',
    component: ContributionsLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard route (default)
      {
        path: '',
        component: ContributionDashboardComponent,
        data: {
          breadcrumb: 'Dashboard'
        }
      },
      // List all contributions
      {
        path: 'list',
        component: ContributionListComponent,
        data: {
          breadcrumb: 'List'
        }
      },
      // Create new contribution
      {
        path: 'create',
        component: ContributionFormComponent,
        data: {
          breadcrumb: 'Create'
        }
      },
      // Pending contributions
      {
        path: 'pending',
        component: PendingContributionsComponent,
        data: {
          breadcrumb: 'Pending'
        }
      },
      // Reports route
      {
        path: 'reports',
        component: ContributionReportsComponent,
        data: {
          breadcrumb: 'Reports'
        }
      },
      // Refunds route
      {
        path: 'refunds',
        component: ContributionListComponent,
        data: {
          filter: { paymentStatus: 'REFUNDED' },
          breadcrumb: 'Refunds'
        },
      },
      // Transaction logs route
      {
        path: 'transactions',
        component: TransactionLogsComponent,
        data: {
          breadcrumb: 'Transactions'
        }
      },
      // View contribution detail (must be last to avoid conflicts)
      {
        path: ':id',
        component: ContributionDetailComponent,
        data: {
          breadcrumb: 'Detail'
        }
      },
    ],
  },
];
