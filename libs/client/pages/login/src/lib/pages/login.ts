import { Component, inject, signal, OnInit, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardFooter, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideMail, lucideLock, lucideArrowLeft } from '@ng-icons/lucide';
import { ThemeToggleComponent } from '@nyots/ui-theme-toggle';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '@nyots/data-source/auth';
import { GOOGLE_CLIENT_ID } from '@nyots/data-source/constants';

declare const google: any;

@Component({
  imports: [
    FormField,
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
    NgIcon,
    RouterLink,
    ThemeToggleComponent,
  ],
  providers: [
    provideIcons({ lucideLoader2, lucideMail, lucideLock, lucideArrowLeft }),
  ],
  templateUrl: 'login.html',
})
export class Login implements OnInit {
  private readonly googleClientId = inject(GOOGLE_CLIENT_ID);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private document = inject(DOCUMENT);
  private elementRef = inject(ElementRef);

  // Login mode toggle: 'password' | 'magicLink'
  loginMode = signal<'password' | 'magicLink'>('password');

  // Password login form
  private loginModel = signal({
    email: '',
    password: '',
  });

  protected loginForm = form(this.loginModel, (form) => {
    required(form.email, { message: 'Email is required' });
    email(form.email, { message: 'Please enter a valid email' });
    required(form.password, { message: 'Password is required' });
  });

  // Magic link form
  private magicLinkModel = signal({
    email: '',
  });

  protected magicLinkForm = form(this.magicLinkModel, (form) => {
    required(form.email, { message: 'Email is required' });
    email(form.email, { message: 'Please enter a valid email' });
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Magic link URL consumption
  magicToken = signal<string | null>(null);
  showTermsDialog = signal(false);
  termsAccepted = signal(false);
  tokenFromUrl = signal<string | null>(null);

  ngOnInit(): void {
    // Check for magic token in URL
    const queryParams = this.route.snapshot.queryParams;
    const token = queryParams['magicToken'];
    if (token) {
      this.tokenFromUrl.set(token);
      this.consumeMagicLink(token);
      return;
    }

    // Initialize Google Identity Services
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: this.handleGoogleAuthResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.renderButton(
        this.elementRef.nativeElement.querySelector('#google-btn-container'),
        { theme: 'outline', size: 'large', width: '100%' },
      );
    }
  }

  setLoginMode(mode: 'password' | 'magicLink') {
    this.loginMode.set(mode);
    this.errorMessage.set(null);
    this.successMessage.set(null);
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

        if (response.data?.login.accessToken) {
          await this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.errors?.[0]?.message || 'Login failed. Please try again.',
        );
        console.error('Login error:', error);
      }
    });
  }

  async onMagicLinkSubmit(e: Event) {
    e.preventDefault();
    await submit(this.magicLinkForm, async (state) => {
      if (!this.magicLinkForm().valid()) {
        return;
      }
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const { email } = state().value();

      try {
        await this.authService.requestMagicLink(email);
        this.isLoading.set(false);
        this.successMessage.set('Check your email for a secure sign-in link!');
      } catch (error: any) {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.errors?.[0]?.message ||
            'Failed to send magic link. Please try again.',
        );
        console.error('Magic link request error:', error);
      }
    });
  }

  async consumeMagicLink(token: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await this.authService.magicLinkLogin(token);
      this.isLoading.set(false);

      if (response.data?.magicLinkLogin?.requiresTermsAcceptance) {
        // New user needs to accept terms
        this.showTermsDialog.set(true);
      } else if (response.data?.magicLinkLogin?.accessToken) {
        // Success — already stored by authService
        await this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.isLoading.set(false);
      this.errorMessage.set(
        error.errors?.[0]?.message || 'Invalid or expired magic link.',
      );
      console.error('Magic link login error:', error);
    }
  }

  async acceptTermsAndLogin() {
    if (!this.termsAccepted()) {
      return;
    }

    const token = this.tokenFromUrl();
    if (!token) return;

    this.isLoading.set(true);
    try {
      const response = await this.authService.magicLinkLogin(token, true);
      this.isLoading.set(false);

      if (response.data?.magicLinkLogin?.accessToken) {
        this.showTermsDialog.set(false);
        await this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.isLoading.set(false);
      this.errorMessage.set(
        error.errors?.[0]?.message ||
          'Failed to create account. Please try again.',
      );
    }
  }

  cancelTermsDialog() {
    this.showTermsDialog.set(false);
    this.tokenFromUrl.set(null);
    this.termsAccepted.set(false);
    // Clear URL
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onGoogleLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
  }

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
