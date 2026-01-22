import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { OverviewComponent } from './overview/overview.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewComponent,
        data: {
          breadcrumb: 'Overview'
        }
      },
      {
        path: 'system-health',
        data: {
          breadcrumb: 'System Health'
        },
        loadChildren: () => import('@nyots/admin-pages/system-health')
      },
      {
        path: 'projects',
        data: {
          breadcrumb: 'Projects'
        },
        loadChildren: () => import('@nyots/admin-pages/projects').then(m => m.projectsRoutes)
      },
      {
        path: 'contributions',
        data: {
          breadcrumb: 'Contributions'
        },
        loadChildren: () => import('@nyots/admin-pages/contributions').then(m => m.contributionsRoutes)
      },
      {
        path: 'users',
        data: {
          breadcrumb: 'Users'
        },
        loadChildren: () => import('@nyots/admin-pages/users').then(m => m.usersRoutes)
      },
    ]
  }
]
