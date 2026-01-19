import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const DashboardRoutes: Routes = [
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
        loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./projects/project-list.component').then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'my-contributions',
        loadComponent: () => import('./my-contributions/my-contributions.component').then(m => m.MyContributionsComponent)
      },
      {
        path: 'contributions/:id',
        loadComponent: () => import('./contribution-detail/contribution-detail.component').then(m => m.ContributionDetailComponent)
      },
      {
        path: 'contributions',
        loadChildren: () => import('@nyots/client-pages/contributions')
      }
    ]
  }
]
