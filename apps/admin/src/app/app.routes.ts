import { Route } from '@angular/router';
import { authGuard, guestGuard } from '@nyots/data-source/auth';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('@nyots/admin-pages/login'),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: {
      breadcrumb: 'Dashboard',
    },
    loadChildren: () => import('@nyots/admin-pages/dashboard'),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
