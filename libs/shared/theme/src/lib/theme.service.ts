import { Injectable, signal, effect, Inject, PLATFORM_ID, RendererFactory2, Renderer2 } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'nyots-theme-preference';
const DARK_CLASS = 'dark';

/**
 * Manages the application's light/dark theme.
 *
 * - Reads a saved preference from localStorage when running in the browser.
 * - Falls back to the OS `prefers-color-scheme` setting when set to `auto`.
 * - Adds/removes the `dark` class on the root element so Tailwind dark variants work.
 *
 * For SSR safety, an inline script in index.html should run before Angular bootstraps
 * to set the initial class and avoid a flash of the wrong theme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Current saved preference. */
  public readonly preference = signal<ThemePreference>('auto');

  /** Whether the UI is currently rendered in dark mode (resolved from preference + OS). */
  public readonly isDark = signal<boolean>(false);

  private _renderer!: Renderer2;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly rendererFactory: RendererFactory2,
  ) {
    this._renderer = this.rendererFactory.createRenderer(null, null);
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFromStorage();
      this.listenToOsPreference();
    } else {
      // SSR: trust whatever the inline script or server context already set.
      this.isDark.set(this.document.documentElement.classList.contains(DARK_CLASS));
    }

    effect(() => {
      const root = this.document.documentElement;
      if (this.isDark()) {
        this._renderer.addClass(root, DARK_CLASS);
      } else {
        this._renderer.removeClass(root, DARK_CLASS);
      }
    });
  }

  /** Toggle between light and dark, ignoring the 'auto' state for the toggle action. */
  toggle(): void {
    const next = !this.isDark();
    this.setPreference(next ? 'dark' : 'light');
  }

  /** Persist a preference and immediately apply it. */
  setPreference(value: ThemePreference): void {
    this.preference.set(value);

    if (isPlatformBrowser(this.platformId)) {
      try {
        this.document.defaultView?.localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // ignore storage errors
      }
    }

    if (value === 'auto') {
      this.isDark.set(this.resolveAutoDark());
    } else {
      this.isDark.set(value === 'dark');
    }
  }

  private initializeFromStorage(): void {
    const root = this.document.documentElement;
    const resolvedFromHtml = root.classList.contains(DARK_CLASS);

    let stored: ThemePreference | null = null;
    try {
      stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    } catch {
      stored = null;
    }

    const preference: ThemePreference = stored ?? 'auto';
    this.preference.set(preference);
    this.isDark.set(preference === 'auto' ? this.resolveAutoDark() : preference === 'dark' || resolvedFromHtml);
  }

  private listenToOsPreference(): void {
    const media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
    if (!media) return;

    const update = () => {
      if (this.preference() === 'auto') {
        this.isDark.set(media.matches);
      }
    };

    // Modern API
    if ('addEventListener' in media) {
      media.addEventListener('change', update);
    } else {
      // Fallback for older Safari
      (media as MediaQueryList).addListener(update);
    }
  }

  private resolveAutoDark(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }

  private applyDarkClass(isDark: boolean): void {
    const root = this.document.documentElement;
    if (isDark) {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
  }
}

export function provideTheme(): { provide: typeof ThemeService; useClass: typeof ThemeService }[] {
  return [{ provide: ThemeService, useClass: ThemeService }];
}
