import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('@nyots/client-pages/login')
  },
  {
    path: 'dashboard',
    loadComponent: () => import('@nyots/admin-pages/dashboard')
  }
];
