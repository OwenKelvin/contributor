import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // {
  //   path: 'dashboard/projects/:id/edit',
  //   renderMode: RenderMode.Server,
  // },
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
