import { Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import {
  form,
  required,
  email,
  submit,
  FormField,
} from '@angular/forms/signals';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideMail, lucideLock, lucideAlertCircle } from '@ng-icons/lucide';
import { ThemeToggleComponent } from '@nyots/ui-theme-toggle';
import { Router } from '@angular/router';
import { AuthService } from '@nyots/data-source/auth';
import { GOOGLE_CLIENT_ID } from '@nyots/data-source/constants';

// Declare google as a global variable
declare const google: any;

@Component({
  imports: [
    FormField,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmIcon,
    NgIcon,
    ThemeToggleComponent,
  ],
  providers: [
    provideIcons({ lucideLoader2, lucideMail, lucideLock, lucideAlertCircle }),
  ],
  templateUrl: 'login.html',
})
export class Login implements OnInit {
  private readonly googleClientId = inject(GOOGLE_CLIENT_ID);
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
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

  ngOnInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: this.handleGoogleAuthResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.renderButton(
        this.elementRef.nativeElement.querySelector('#google-btn-container'),
        { theme: 'outline', size: 'large' }, // customization attributes
      );
    }
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    await submit(this.loginForm, async (state) => {
      if (!this.loginForm().valid()) {
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

  // async onGoogleLogin() {
  //   this.isLoading.set(true);
  //   this.errorMessage.set(null);
  //
  //   try {
  //     const googleOAuthUrl = await this.authService.getGoogleOAuthUrl();
  //     window.location.href = googleOAuthUrl;
  //   } catch (error: any) {
  //     console.error('Google login initiation error:', error);
  //     this.isLoading.set(false);
  //     this.errorMessage.set(error.message || 'Failed to initiate Google login.');
  //   }
  // }

  private async handleGoogleAuthResponse(response: any) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    if (response.credential) {
      try {
        const backendResponse = await this.authService.googleLogin(
          response.credential,
        );
        if (backendResponse.data?.googleLogin.accessToken) {
          await this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        console.error('Backend Google login error:', error);
        this.errorMessage.set(
          error.errors?.[0]?.message || 'Google login failed on backend.',
        );
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.errorMessage.set(
        'Google authentication failed: No credential received.',
      );
      this.isLoading.set(false);
    }
  }
}
