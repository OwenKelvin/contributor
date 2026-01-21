import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, Field, required, email, submit } from '@angular/forms/signals';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardFooter, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmIcon, HlmIconImports } from '@nyots/ui/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideMail } from '@ng-icons/lucide';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@nyots/data-source/auth';

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
  providers: [provideIcons({ lucideLoader2, lucideMail })],
  templateUrl: 'forgot-password.html',
})
export class ForgotPassword {
  private authService = inject(AuthService);
  private router = inject(Router);

  private forgotPasswordModel = signal({
    email: '',
  });

  protected forgotPasswordForm = form(this.forgotPasswordModel, (form) => {
    required(form.email, { message: 'Email is required' });
    email(form.email, { message: 'Please enter a valid email' });
  });

  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  async onSubmit(e: Event) {
    e.preventDefault();
    await submit(this.forgotPasswordForm, async (state) => {
      if (!this.forgotPasswordForm().valid()) {
        return;
      }
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const { email } = state().value();

      try {
        const response = await this.authService.requestPasswordReset(email);
        this.isLoading.set(false);

        if (response.data?.requestPasswordReset) {
          this.successMessage.set(
            'If an account with this email exists, a password reset link has been sent.',
          );
        }
      } catch (error: any) {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.errors?.[0]?.message ||
            'An error occurred. Please try again.',
        );
        console.error('Forgot password error:', error);
      }
    });
  }
}
