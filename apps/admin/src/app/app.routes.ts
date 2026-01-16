import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('@nyots/client-pages/login')
  },
  {
    path: 'dashboard',
    loadChildren: () => import('@nyots/admin-pages/dashboard')
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
