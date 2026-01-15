import { InjectionToken } from '@angular/core';

export const BACKEND_URL = new InjectionToken<string>('backend-url');
export const APP_NAME = new InjectionToken<string>('app-name');
export const GOOGLE_CLIENT_ID = new InjectionToken<string>('google-client-id');
export const SHOW_SUCCESS_MESSAGE = 'show-success-message';

export const provideBackendUrl = (url: string) => {
  return {
    provide: BACKEND_URL,
    useValue: url,
  }
}


