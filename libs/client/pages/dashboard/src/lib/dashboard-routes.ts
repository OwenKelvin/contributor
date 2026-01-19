import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const DashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboard,
    data: { breadcrumb: 'Dashboard' },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        data: { breadcrumb: 'Overview' },
        loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'projects',
        data: { breadcrumb: 'Projects' },
        loadComponent: () => import('./projects/project-list.component').then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/:id',
        data: { breadcrumb: 'Project Details' },
        loadComponent: () => import('./project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'contributions',
        data: { breadcrumb: 'Contributions' },
        loadChildren: () => import('@nyots/client-pages/contributions')
      },
      {
        path: 'my-activity',
        data: { breadcrumb: 'My Activity' },
        loadComponent: () => import('./my-activity/my-activity.component').then(m => m.MyActivityComponent)
      }
    ]
  }
]
