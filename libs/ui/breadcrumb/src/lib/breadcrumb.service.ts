import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from './breadcrumb';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly _breadcrumbs = signal<Breadcrumb[]>([]);
  readonly breadcrumbs = this._breadcrumbs.asReadonly();

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
        this._breadcrumbs.set(breadcrumbs);
      });
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const child = route.firstChild;
    if (!child) {
      return breadcrumbs;
    }

    const routeURL = child.snapshot.url
      .map(segment => segment.path)
      .join('/');

    const nextUrl = routeURL ? `${url}/${routeURL}` : url;
    const label = child.snapshot.data['breadcrumb'];

    let nextBreadcrumbs = breadcrumbs;

    if (label) {
      const last = breadcrumbs[breadcrumbs.length - 1];

      if (!last || last.label !== label || last.url !== nextUrl) {
        nextBreadcrumbs = [...breadcrumbs, { label, url: nextUrl }];
      }
    }

    return this.createBreadcrumbs(child, nextUrl, nextBreadcrumbs);
  }

}
