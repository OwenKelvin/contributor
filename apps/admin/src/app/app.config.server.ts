import {
  mergeApplicationConfig,
  ApplicationConfig,
  provideAppInitializer,
  inject,
  TransferState,
  makeStateKey,
} from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import {
  BACKEND_URL_KEY,
  GOOGLE_CLIENT_ID_KEY,
} from '@nyots/data-source/constants';


const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideAppInitializer(() => {
      const transferState = inject(TransferState);
      transferState.set(
        BACKEND_URL_KEY,
        process.env['BACKEND_URL'],
      );
      transferState.set(
        GOOGLE_CLIENT_ID_KEY,
        process.env['GOOGLE_CLIENT_ID'],
      );
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
