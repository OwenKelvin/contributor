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
    path: 'forgot-password',
    loadComponent: () => import('@nyots/client-pages/forgot-password')
  },
  {
    path: 'reset-password',
    loadComponent: () => import('@nyots/client-pages/reset-password')
  },
  {
    path: 'auth',
    loadChildren: () => import('@nyots/client-pages/auth')
  },
  {
    path: 'dashboard',
    loadChildren: () => import('@nyots/client-pages/dashboard')
  }
];
