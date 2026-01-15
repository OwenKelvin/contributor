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
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@nyots/data-source/auth';
import { firstValueFrom } from 'rxjs';

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
  private authService = inject(AuthService);
  private router = inject(Router);

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

  async onSubmit(e: Event) {
    e.preventDefault()
    await submit(this.loginForm, async (state) => {
      if (!this.loginForm().valid) {
        return;
      }
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials = state().value();

      try {

        const response = await this.authService.login(credentials);

        this.isLoading.set(false);
        console.log(response);

        if (response.data?.login.accessToken) {
          // Navigate to dashboard or home page
          await this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        console.log({ error });
        this.isLoading.set(false);
        this.errorMessage.set(
          error.errors?.[0]?.message || 'Login failed. Please try again.',
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
