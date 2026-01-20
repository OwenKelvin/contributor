import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@nyots/data-source/auth';
import { HlmSpinner } from '@nyots/ui/spinner'; // Assuming a spinner component exists

@Component({
  standalone: true,
  imports: [CommonModule, HlmSpinner],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
      <hlm-spinner class="h-12 w-12 text-primary"></hlm-spinner>
      <p class="mt-4 text-lg text-muted-foreground">Processing Google login...</p>
    </div>
  `,
  styleUrls: [],
})
export class OauthCallback implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const token = params['token'];
      const error = params['error'];

      if (token) {
        this.authService.handleOAuthCallback(token);
      } else if (error) {
        console.error('OAuth Error:', error);
        this.router.navigate(['/login'], { queryParams: { error: 'OAuth failed: ' + error } });
      } else {
        console.error('No token or error found in OAuth callback.');
        this.router.navigate(['/login'], { queryParams: { error: 'OAuth callback failed' } });
      }
    });
  }
}
