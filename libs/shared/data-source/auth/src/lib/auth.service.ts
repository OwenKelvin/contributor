import { inject, Injectable } from '@angular/core';
import { IGoogleOAuthUrlGQL, ILoginGQL, IRegisterGQL } from './auth.generated';
import { ILoginInput, IRegisterInput } from '@nyots/data-source';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loginGQL = inject(ILoginGQL);
  registerGQL = inject(IRegisterGQL);
  googleOAuthUrlGQL = inject(IGoogleOAuthUrlGQL);
  router = inject(Router);

  async login(credentials: ILoginInput) {
    const response = await firstValueFrom(
      this.loginGQL.mutate({
        variables: credentials,
      }),
    );
    if (response.data?.login.accessToken) {
      // Store tokens
      localStorage.setItem('accessToken', response.data?.login.accessToken);
      localStorage.setItem('refreshToken', response.data?.login.accessToken);

      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data?.login.user));
    }
    return response;
  }

  async register(registerInput: IRegisterInput) {
    const response = await firstValueFrom(
      this.registerGQL.mutate({
        variables: registerInput,
      }),
    );
    if (response.data?.register.accessToken) {
      // Store tokens
      localStorage.setItem('accessToken', response.data?.register.accessToken);
      localStorage.setItem('refreshToken', response.data?.register.accessToken);

      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data?.register.user));
    }
    return response;
  }

  logout() {
    // Clear tokens and user info
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Redirect to login page
    this.router.navigate(['/login']);
  }

  async getGoogleOAuthUrl(): Promise<string> {
    const response = await firstValueFrom(this.googleOAuthUrlGQL.fetch());
    if (response.data?.googleOAuthUrl.url) {
      return response.data.googleOAuthUrl.url;
    }
    throw new Error('Could not retrieve Google OAuth URL');
  }

  handleOAuthCallback(token: string): void {
    if (token) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', token); // Assuming refresh token is same for now or not provided via callback
      // Optionally fetch user info if not included in token or separate endpoint
      this.router.navigate(['/dashboard']);
    } else {
      console.error('No token received from OAuth callback.');
      this.router.navigate(['/login'], { queryParams: { error: 'OAuth failed' } });
    }
  }
}