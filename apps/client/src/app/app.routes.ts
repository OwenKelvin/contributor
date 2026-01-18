import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('@nyots/client-pages/login')
  },
  {
    path: 'register',
    loadComponent: () => import('@nyots/client-pages/register')
  },
  {
    path: 'dashboard',
    loadChildren: () => import('@nyots/client-pages/dashboard')
  }
];
