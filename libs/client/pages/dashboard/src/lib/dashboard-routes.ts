import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const DashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: 'contributions',
        loadChildren: () => import('@nyots/client-pages/contributions')
      }
    ]
  }
]
