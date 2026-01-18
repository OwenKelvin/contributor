
import { Component, inject } from '@angular/core';
import {
  HlmSidebar,
  HlmSidebarContent, HlmSidebarFooter,
  HlmSidebarGroup,
  HlmSidebarGroupContent,
  HlmSidebarHeader,
  HlmSidebarInset,
  HlmSidebarMenu,
  HlmSidebarMenuButton,
  HlmSidebarMenuItem, HlmSidebarMenuSub, HlmSidebarMenuSubButton, HlmSidebarMenuSubItem,
  HlmSidebarTrigger,
  HlmSidebarWrapper
} from '@nyots/ui/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@nyots/ui/icon';
import {
  lucideBarChart3,
  lucideChevronRight,
  lucideFileText,
  lucideFolderOpen, lucideHistory,
  lucidePlus,
  lucideWallet,
  lucideChevronDown, lucideChevronUp
} from '@ng-icons/lucide';
import { HlmCollapsible, HlmCollapsibleContent, HlmCollapsibleTrigger } from '@nyots/ui/collapsible';
import { NgOptimizedImage } from '@angular/common';
import { HlmDropdownMenu, HlmDropdownMenuItem, HlmDropdownMenuTrigger } from '@nyots/ui/dropdown-menu';
import { ConfirmationDialogComponent, HlmDialogService } from '@nyots/ui/dialog';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@nyots/data-source/auth';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarGroup,
    HlmSidebarHeader,
    HlmSidebarWrapper,
    HlmSidebarGroupContent,
    HlmSidebarMenu,
    HlmSidebarMenuItem,
    HlmSidebarMenuButton,
    NgIcon,
    HlmIcon,
    HlmSidebarInset,
    HlmSidebarTrigger,
    HlmCollapsible,
    HlmCollapsibleTrigger,
    HlmCollapsibleContent,
    HlmSidebarMenuSubItem,
    HlmSidebarMenuSub,
    HlmSidebarMenuSubButton,
    NgOptimizedImage,
    HlmDropdownMenu,
    HlmSidebarFooter,
    HlmDropdownMenuItem,
    HlmDropdownMenuTrigger,
    RouterOutlet,
  ],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <div hlmSidebarHeader class="flex items-center gap-2 px-4 py-3">
          <div class="flex items-center w-full">
            <img class="w-16" ngSrc="/logo.svg" width="472" height="472" alt="" priority="" />
            <span class="ms-4 text-lg font-semibold">NyotsCo.</span>
          </div>
        </div>
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                @for (item of _items; track item.title) {
                  <hlm-collapsible
                    [expanded]="item.defaultOpen"
                    class="group/collapsible"
                  >
                    <li hlmSidebarMenuItem>
                      <button
                        hlmCollapsibleTrigger
                        hlmSidebarMenuButton
                        class="flex w-full items-center justify-between"
                      >
                        <div class="flex items-center gap-2">
                          <ng-icon [name]="item.icon" hlm size="sm" />
                          <span>{{ item.title }}</span>
                        </div>
                        <ng-icon
                          name="lucideChevronRight"
                          class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
                          hlm
                        />
                      </button>
                      <hlm-collapsible-content>
                        <ul hlmSidebarMenuSub>
                          @for (subItem of item.items; track subItem.title) {
                            <li hlmSidebarMenuSubItem>
                              <button
                                hlmSidebarMenuSubButton
                                class="flex w-full items-center gap-2"
                              >
                                <ng-icon
                                  [name]="subItem.icon"
                                  hlm
                                  size="sm"
                                  class="text-muted-foreground"
                                />
                                <span>{{ subItem.title }}</span>
                              </button>
                            </li>
                          }
                        </ul>
                      </hlm-collapsible-content>
                    </li>
                  </hlm-collapsible>
                }
              </ul>
            </div>
          </div>
        </div>
        <div hlmSidebarFooter>
          <ul hlmSidebarMenu>
            <li hlmSidebarMenuItem>
              <button hlmSidebarMenuButton [hlmDropdownMenuTrigger]="menu">
                My Account
                <ng-icon hlmIcon name="lucideChevronUp" class="ml-auto" />
              </button>
              <ng-template #menu>
                <hlm-dropdown-menu class="w-60">
                  <button hlmDropdownMenuItem>Profile</button>
                  <button hlmDropdownMenuItem>Settings</button>
                  <button hlmDropdownMenuItem (click)="signOut()">Sign out</button>
                </hlm-dropdown-menu>
              </ng-template>
            </li>
          </ul>
        </div>
      </hlm-sidebar>
      <main hlmSidebarInset>
        <header class="flex h-12 items-center justify-between px-4">
          <button hlmSidebarTrigger>
            <span class="sr-only">Toggle Sidebar</span>
          </button>
        </header>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  providers: [
    provideIcons({
      lucideChevronRight,
      lucideFolderOpen,
      lucideWallet,
      lucidePlus,
      lucideBarChart3,
      lucideHistory,
      lucideFileText,
      lucideChevronDown,
      lucideChevronUp,
    }),
  ],
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(HlmDialogService);
  protected readonly _items = [
    {
      title: 'Projects',
      icon: 'lucideFolderOpen',
      defaultOpen: true,
      items: [
        { title: 'Browse All Projects', icon: 'lucideFolderOpen' },
        { title: 'Active Projects', icon: 'lucideBarChart3' },
        { title: 'Completed Projects', icon: 'lucideHistory' },
        { title: 'Favorite Projects', icon: 'lucidePlus' },
      ],
    },
    {
      title: 'My Contributions',
      icon: 'lucideWallet',
      defaultOpen: false,
      items: [
        { title: 'Overview', icon: 'lucideBarChart3' },
        { title: 'By Project', icon: 'lucideFolderOpen' },
        { title: 'By Date', icon: 'lucideHistory' },
        { title: 'Recurring Contributions', icon: 'lucideWallet' },
        { title: 'Pending Contributions', icon: 'lucideFileText' },
      ],
    },
    {
      title: 'Make Contribution',
      icon: 'lucidePlus',
      defaultOpen: false,
      items: [
        { title: 'One-time Contribution', icon: 'lucidePlus' },
        { title: 'Set Up Recurring', icon: 'lucideWallet' },
        { title: 'Quick Contribute', icon: 'lucideChevronRight' },
        { title: 'Custom Amount', icon: 'lucideFileText' },
      ],
    },
    {
      title: 'Reports & Analytics',
      icon: 'lucideBarChart3',
      defaultOpen: false,
      items: [
        { title: 'Contribution Summary', icon: 'lucideBarChart3' },
        { title: 'Impact Dashboard', icon: 'lucideBarChart3' },
        { title: 'Monthly Reports', icon: 'lucideFileText' },
        { title: 'Tax Documents', icon: 'lucideFileText' },
      ],
    },
    {
      title: 'History',
      icon: 'lucideHistory',
      defaultOpen: false,
      items: [
        { title: 'Transaction History', icon: 'lucideHistory' },
        { title: 'Receipts', icon: 'lucideFileText' },
        { title: 'Export History', icon: 'lucideChevronDown' },
      ],
    },
  ];

  async signOut() {
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Sign Out',
        message: 'Are you sure you want to sign out?',
        confirmLabel: 'Sign Out',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      },
    });

    const result = await firstValueFrom(dialogRef.closed$);
    if (result === true) {
      this.authService.logout();
    }
  }
}
