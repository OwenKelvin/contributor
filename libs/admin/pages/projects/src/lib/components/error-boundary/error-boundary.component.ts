import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@nyots/ui/button';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle, lucideRefreshCw } from '@ng-icons/lucide';

@Component({
  selector: 'nyots-error-boundary',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideRefreshCw,
    }),
  ],
  template: `
    <div class="flex items-center justify-center min-h-[400px] p-6">
      <div hlmCard class="max-w-md w-full">
        <div hlmCardHeader>
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ng-icon hlmIcon name="lucideAlertTriangle" size="24" class="text-destructive" />
            </div>
            <div>
              <h3 hlmCardTitle>{{ title() }}</h3>
              <p hlmCardDescription>{{ message() }}</p>
            </div>
          </div>
        </div>
        <div hlmCardContent>
          @if (details()) {
            <div class="mb-4 rounded-md bg-muted p-3">
              <p class="text-sm text-muted-foreground font-mono">{{ details() }}</p>
            </div>
          }
          <div class="flex gap-2">
            <button hlmBtn (click)="onRetry()" [disabled]="isRetrying()">
              @if (isRetrying()) {
                <ng-icon hlmIcon name="lucideRefreshCw" size="16" class="mr-2 animate-spin" />
              } @else {
                <ng-icon hlmIcon name="lucideRefreshCw" size="16" class="mr-2" />
              }
              {{ retryLabel() }}
            </button>
            @if (showGoBack()) {
              <button hlmBtn variant="outline" (click)="onGoBack()">
                Go Back
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ErrorBoundaryComponent {
  // Inputs
  title = input<string>('Something went wrong');
  message = input<string>('An unexpected error occurred. Please try again.');
  details = input<string | null>(null);
  retryLabel = input<string>('Try Again');
  showGoBack = input<boolean>(false);

  // Outputs
  retry = output<void>();
  goBack = output<void>();

  // State
  isRetrying = signal(false);

  async onRetry() {
    this.isRetrying.set(true);
    this.retry.emit();
    // Reset after a short delay to allow the retry to complete
    setTimeout(() => this.isRetrying.set(false), 1000);
  }

  onGoBack() {
    this.goBack.emit();
  }
}
