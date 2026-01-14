import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { form, Field, required, email, submit } from '@angular/forms/signals';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardFooter, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmIcon, HlmIconImports } from '@nyots/ui/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideMail, lucideLock } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

@Component({
  imports: [
    CommonModule,
    Field,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardFooter,
    HlmCardHeader,
    HlmCardTitle,
    HlmIcon,
    HlmIconImports,
    RouterLink,
  ],
  providers: [provideIcons({ lucideLoader2, lucideMail, lucideLock })],
  templateUrl: 'login.html',
})
export class Login {
  private http = inject(HttpClient);

  // Form model - single source of truth
  private loginModel = signal({
    email: '',
    password: '',
  });

  // Create form with validation schema
  protected loginForm = form(this.loginModel, (form) => {
    required(form.email, { message: 'Email is required' });
    email(form.email, { message: 'Please enter a valid email' });
    required(form.password, { message: 'Password is required' });
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async onSubmit() {
    if (!this.loginForm().valid) {
      return;
    }

    await submit(this.loginForm, async (state) => {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials = state().value();

      try {
        const response = await this.http
          .post<LoginResponse>('api/auth/login', credentials)
          .toPromise();

        this.isLoading.set(false);

        if (response && response.success) {
          // Store tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // Store user info
          localStorage.setItem('user', JSON.stringify(response.data.user));

          console.log('Login successful:', response.data.user);
          // Navigate to dashboard or home page
          // this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Login failed. Please try again.',
        );
        console.error('Login error:', error);
      }
    });
  }

  onGoogleLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Implement Google OAuth flow
    // This is a placeholder - implement actual Google OAuth
    console.log('Google login clicked');

    // Example: Redirect to Google OAuth endpoint
    // window.location.href = 'api/auth/google';

    this.isLoading.set(false);
  }
}
