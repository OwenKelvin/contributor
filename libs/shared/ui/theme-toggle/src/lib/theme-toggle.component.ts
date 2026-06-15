import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon, lucideMonitor } from '@ng-icons/lucide';
import { ThemeService, type ThemePreference } from '@nyots/theme';

@Component({
  selector: 'nyots-theme-toggle',
  standalone: true,
  imports: [CommonModule, HlmButton, HlmIcon, NgIcon],
  providers: [provideIcons({ lucideSun, lucideMoon, lucideMonitor })],
  template: `
    <div
      class="relative flex items-center gap-1 rounded-lg border border-border bg-background p-1"
    >
      <button
        type="button"
        hlmBtn
        variant="ghost"
        size="icon-sm"
        class="rounded-md"
        [class.bg-accent]="preference() === 'light'"
        (click)="setPreference('light')"
        aria-label="Use light theme"
        title="Light"
      >
        <ng-icon hlmIcon name="lucideSun" size="sm" />
      </button>

      <button
        type="button"
        hlmBtn
        variant="ghost"
        size="icon-sm"
        class="rounded-md"
        [class.bg-accent]="preference() === 'dark'"
        (click)="setPreference('dark')"
        aria-label="Use dark theme"
        title="Dark"
      >
        <ng-icon hlmIcon name="lucideMoon" size="sm" />
      </button>

      <button
        type="button"
        hlmBtn
        variant="ghost"
        size="icon-sm"
        class="rounded-md"
        [class.bg-accent]="preference() === 'auto'"
        (click)="setPreference('auto')"
        aria-label="Match system theme"
        title="System"
      >
        <ng-icon hlmIcon name="lucideMonitor" size="sm" />
      </button>
    </div>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly preference = this.theme.preference;

  setPreference(value: ThemePreference): void {
    this.theme.setPreference(value);
  }
}
