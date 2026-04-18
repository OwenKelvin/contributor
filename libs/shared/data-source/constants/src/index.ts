import {
  inject,
  InjectionToken,
  makeStateKey,
  TransferState,
} from '@angular/core';

export const BACKEND_URL = new InjectionToken<string>('backend-url');
export const APP_NAME = new InjectionToken<string>('app-name');
export const GOOGLE_CLIENT_ID = new InjectionToken<string>('google-client-id');
export const SHOW_SUCCESS_MESSAGE = 'show-success-message';

export const BACKEND_URL_KEY = makeStateKey<string>('BACKEND_URL');
export const GOOGLE_CLIENT_ID_KEY = makeStateKey<string>('GOOGLE_CLIENT_ID');

export const provideBackendUrl = () => {
  return {
    provide: BACKEND_URL,
    useFactory: () => {
      return inject(TransferState).get(
        BACKEND_URL_KEY,
        'http://localhost:3000',
      );
    },
  };
};

export const provideGoogleClientId = () => {
  return {
    provide: GOOGLE_CLIENT_ID,
    useFactory: () => inject(TransferState).get(GOOGLE_CLIENT_ID_KEY, ''),
  };
};
