import {
  ApplicationConfig, inject, provideAppInitializer,
  provideBrowserGlobalErrorListeners, TransferState,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { apolloConfig } from '@nyots/data-source/apollo';
import { provideApollo } from 'apollo-angular';
import { BACKEND_URL_KEY, GOOGLE_CLIENT_ID_KEY, provideBackendUrl, provideGoogleClientId } from '@nyots/data-source/constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideApollo(apolloConfig),
    provideAppInitializer(() => {
      const transferState = inject(TransferState);
      const backendUrl = transferState.get(
        BACKEND_URL_KEY,
        'http://localhost:3000',
      );
      const googleClientId = transferState.get(GOOGLE_CLIENT_ID_KEY, '');
    }),

    provideBackendUrl(),
    provideGoogleClientId(),
  ],
};
