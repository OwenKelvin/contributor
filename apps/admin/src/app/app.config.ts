import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { apolloConfig } from '@nyots/data-source/apollo';
import { provideApollo } from 'apollo-angular';
import { provideBackendUrl } from '@nyots/data-source/constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideApollo(apolloConfig),
    provideBackendUrl('http://localhost:3000'),
  ],
};
