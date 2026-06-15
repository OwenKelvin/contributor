import {
  mergeApplicationConfig,
  ApplicationConfig,
  provideAppInitializer,
  inject,
  TransferState,
  REQUEST_CONTEXT,
} from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import {
  BACKEND_URL_KEY,
  GOOGLE_CLIENT_ID_KEY,
} from '@nyots/data-source/constants';

interface RequestContext {
  backendUrl?: string;
  theme?: 'light' | 'dark';
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideAppInitializer(() => {
      const transferState = inject(TransferState);
      const requestContext = inject(REQUEST_CONTEXT) as RequestContext | undefined;
      const backendUrl = requestContext?.backendUrl || process.env['BACKEND_URL'];
      transferState.set(BACKEND_URL_KEY, backendUrl);
      transferState.set(GOOGLE_CLIENT_ID_KEY, process.env['GOOGLE_CLIENT_ID']);
      // SSR theme: the inline script in index.html already sets the class for direct navigation;
      // this just ensures the rendered DOM matches the resolved theme context.
      const theme = requestContext?.theme ?? 'light';
      if (theme === 'dark') {
        transferState.set({} as any, 'dark');
      }
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
