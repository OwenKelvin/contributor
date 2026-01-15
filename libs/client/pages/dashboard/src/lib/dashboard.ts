
import { Component } from '@angular/core';
import {
  HlmSidebar,
  HlmSidebarContent,
  HlmSidebarFooter,
  HlmSidebarGroup,
  HlmSidebarGroupContent,
  HlmSidebarGroupLabel,
  HlmSidebarHeader,
  HlmSidebarInset,
  HlmSidebarMenu,
  HlmSidebarMenuButton,
  HlmSidebarMenuItem,
  HlmSidebarTrigger,
  HlmSidebarWrapper
} from '@nyots/ui/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@nyots/ui/icon';
import { lucideChevronDown, lucideChevronUp, lucideHouse, lucideSettings } from '@ng-icons/lucide';
import { RouterOutlet } from '@angular/router';
import {
  HlmDropdownMenu,
  HlmDropdownMenuItem,
  HlmDropdownMenuLabel,
  HlmDropdownMenuTrigger
} from '@nyots/ui/dropdown-menu';

@Component({
  imports: [
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarFooter,
    HlmSidebarGroup,
    HlmSidebarHeader,
    HlmSidebarWrapper,
    HlmSidebarGroupLabel,
    HlmSidebarGroupContent,
    HlmSidebarMenu,
    HlmSidebarMenuItem,
    HlmSidebarMenuButton,
    NgIcon,
    HlmIcon,
    HlmSidebarInset,
    HlmSidebarTrigger,
    RouterOutlet,
    HlmDropdownMenuTrigger,
    HlmDropdownMenu,
    HlmDropdownMenuLabel,
    HlmDropdownMenuItem,
  ],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <div hlmSidebarHeader class="flex items-center gap-2 px-4 py-3">
          <div class="flex items-center w-full">
            <img src="/logo.svg" alt="My App" class="h-16 w-16" />
            <span class="text-lg font-semibold">NyotsCo</span>
          </div>
        </div>
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupLabel>Application</div>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                @for (item of _items; track item.title) {
                  <li hlmSidebarMenuItem>
                    <a hlmSidebarMenuButton>
                      <ng-icon hlm [name]="item.icon" />
                      <span>{{ item.title }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
        <div hlmSidebarFooter>
          <ul hlmSidebarMenu>
            <li hlmSidebarMenuItem>
              <button hlmSidebarMenuButton [hlmDropdownMenuTrigger]="menu">
                Select Project
                <ng-icon hlm name="lucideChevronUp" class="ml-auto" />
              </button>
              <ng-template #menu>
                <hlm-dropdown-menu class="w-60">
                  <button hlmDropdownMenuItem>Coming soon</button>
                </hlm-dropdown-menu>
              </ng-template>
            </li>
          </ul>
        </div>
      </hlm-sidebar>
      <main hlmSidebarInset>
        <header class="flex h-12 items-center justify-between px-4">
          <button hlmSidebarTrigger><span class="sr-only"></span></button>
          <router-outlet />
        </header>
      </main>
    </div>
  `,
  providers: [
    provideIcons({
      lucideHouse,
      lucideSettings,
      lucideChevronDown,
      lucideChevronUp
    }),
  ],
})
export class Dashboard {
  protected readonly _items = [
    {
      title: 'Home',
      url: '#',
      icon: 'lucideHouse',
    },
    {
      title: 'Settings',
      url: '#',
      icon: 'lucideSettings',
    },
  ];
}
