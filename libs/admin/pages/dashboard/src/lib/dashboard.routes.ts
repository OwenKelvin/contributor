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
        component: OverviewComponent
      },
      {
        path: 'projects',
        loadChildren: () => import('@nyots/admin-pages/projects').then(m => m.projectsRoutes)
      },
      {
        path: 'contributions',
        loadChildren: () => import('@nyots/admin-pages/contributions').then(m => m.contributionsRoutes)
      },
      {
        path: 'users',
        loadChildren: () => import('@nyots/admin-pages/users').then(m => m.usersRoutes)
      },
    ]
  }
]
