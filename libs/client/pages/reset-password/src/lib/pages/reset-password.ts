import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, Field, required, minLength, submit, validate } from '@angular/forms/signals';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardFooter, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmIcon, HlmIconImports } from '@nyots/ui/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideLock, lucideKey } from '@ng-icons/lucide';
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
  providers: [provideIcons({ lucideLoader2, lucideLock, lucideKey })],
  templateUrl: 'reset-password.html',
})
export class ResetPassword implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  token = signal<string | null>(null);

  private resetPasswordModel = signal({
    newPassword: '',
    confirmPassword: '',
  });

  protected resetPasswordForm = form(this.resetPasswordModel, (form) => {
    required(form.newPassword, { message: 'New password is required' });
    minLength(form.newPassword, 8, {
      message: 'Password must be at least 8 characters long',
    });
    required(form.confirmPassword, { message: 'Please confirm your password' });
    validate(form.confirmPassword, ({ value, valueOf }) => {
      const confirmPassword = value();
      const newPassword = valueOf(form.newPassword);
      if (confirmPassword !== newPassword) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
  });

  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      if (token) {
        this.token.set(token);
      } else {
        this.errorMessage.set('No reset token found.');
      }
    });
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    await submit(this.resetPasswordForm, async (state) => {
      if (!this.resetPasswordForm().valid() || !this.token()) {
        return;
      }
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const { newPassword } = state().value();

      try {
        const response = await this.authService.resetPassword(
          this.token() ?? '',
          newPassword,
        );
        this.isLoading.set(false);

        if (response.data?.resetPassword) {
          this.successMessage.set(
            'Your password has been reset successfully. You can now log in.',
          );
          setTimeout(() => this.router.navigate(['/login']), 3000);
        }
      } catch (error: any) {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.errors?.[0]?.message ||
            'An error occurred. Please try again.',
        );
        console.error('Reset password error:', error);
      }
    });
  }
}
