import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ouath-callback/oauth-callback').then(m => m.OauthCallback),
  },
];
