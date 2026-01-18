import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('@nyots/admin-pages/login')
  },
  {
    path: 'dashboard',
    data: {
      breadcrumb: 'Dashboard'
    },
    loadChildren: () => import('@nyots/admin-pages/dashboard')
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
