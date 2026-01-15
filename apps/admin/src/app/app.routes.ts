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
    loadComponent: () => import('@nyots/admin-pages/dashboard')
  },
  {
    path: 'projects',
    loadChildren: () => import('@nyots/admin-pages/projects').then(m => m.projectsRoutes)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
