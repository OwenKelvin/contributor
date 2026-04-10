import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard/projects/:id/view',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:id/view',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'contributions/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'users/:id/view',
    renderMode: RenderMode.Server,
  },
  {
    path: 'dashboard/users/:id/view',
    renderMode: RenderMode.Server,
  },
  {
    path: 'dashboard/projects/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'dashboard/contributions/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
