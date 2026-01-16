import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: 'projects',
        loadChildren: () => import('@nyots/admin-pages/projects').then(m => m.projectsRoutes)
      },
      {
        path: 'contributions',
        loadChildren: () => import('@nyots/admin-pages/contributions').then(m => m.contributionsRoutes)
      },
    ]
  }
]
