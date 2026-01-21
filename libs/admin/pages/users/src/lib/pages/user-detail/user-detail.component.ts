import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IGetUserByIdQuery, UserService } from '@nyots/data-source/user';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEdit, lucideBan, lucideRotateCcw } from '@ng-icons/lucide';
import { HlmButton } from '@nyots/ui/button';
import { HlmButtonGroup } from '@nyots/ui/button-group';
import { HlmIcon } from '@nyots/ui/icon';
import { HlmBadge } from '@nyots/ui/badge';
import { HlmSpinner } from '@nyots/ui/spinner';
import { HlmLabel } from '@nyots/ui/label';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { ErrorBoundary } from '@nyots/ui/alert';

@Component({
  selector: 'nyots-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    HlmButtonGroup,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmLabel,
    HlmSpinner,
    HlmBadge,
    HlmIcon,
    NgIcon,
    ErrorBoundary,
    // Add other nyots-ui components as needed for displaying user details
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  providers: [provideIcons({ lucideEdit, lucideBan, lucideRotateCcw })],
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  userId = signal<string | null>(null);
  user = signal<IGetUserByIdQuery['getUserById'] | undefined>(undefined);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  errorDetails = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.userId.set(id);
        this.loadUserDetails(id);
      } else {
        this.hasError.set(true);
        this.errorMessage.set('User ID not found in route parameters.');
        this.isLoading.set(false);
      }
    });
  }

  async loadUserDetails(id: string): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);
    this.errorDetails.set(null);

    try {
      const user = await this.userService.getUserById(id);
      if (user) {
        this.user.set(user);
      } else {
        this.hasError.set(true);
        this.errorMessage.set('User not found.');
      }
    } catch (error: any) {
      this.hasError.set(true);
      this.errorMessage.set('Failed to load user details.');
      this.errorDetails.set(error.message || 'Unknown error');
    } finally {
      this.isLoading.set(false);
    }
  }

  onEditUser(): void {
    if (this.userId()) {
      // Assuming an edit route for users similar to projects
      this.router.navigate(['/dashboard', 'users', this.userId(), 'edit']);
    }
  }

  onBanUnbanUser(): void {
    // Implement ban/unban logic here
    console.log('Ban/Unban User:', this.userId());
  }

  onResetPassword(): void {
    // Implement reset password logic here
    console.log('Reset Password for User:', this.userId());
  }
}
