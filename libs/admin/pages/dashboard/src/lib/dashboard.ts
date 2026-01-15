import { Component } from '@angular/core';
import {
  HlmSidebar,
  HlmSidebarContent,
  HlmSidebarGroup,
  HlmSidebarGroupContent,
  HlmSidebarHeader,
  HlmSidebarInset,
  HlmSidebarMenu,
  HlmSidebarMenuButton,
  HlmSidebarMenuItem,
  HlmSidebarMenuSub,
  HlmSidebarMenuSubButton,
  HlmSidebarMenuSubItem,
  HlmSidebarTrigger,
  HlmSidebarWrapper
} from '@nyots/ui/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@nyots/ui/icon';
import {
  lucideBarChart3,
  lucideChevronRight,
  lucideFileText,
  lucideFolderOpen,
  lucideHistory,
  lucidePlus,
  lucideWallet,
  lucideUsers,
  lucideSettings,
  lucideShield,
  lucideUserCheck,
  lucideListChecks,
  lucideDollarSign,
  lucideTrendingUp,
  lucideArchive,
  lucideAlertCircle
} from '@ng-icons/lucide';
import { HlmCollapsible, HlmCollapsibleContent, HlmCollapsibleTrigger } from '@nyots/ui/collapsible';
import { NgOptimizedImage } from '@angular/common';

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
  ],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <div hlmSidebarHeader class="flex items-center gap-2 px-4 py-3">
          <div class="flex items-center w-full">
            <img class="w-16" ngSrc="/logo.svg" width="472" height="472" alt="Admin Logo" priority="" />
            <span class="ms-4 text-lg font-semibold">NyotsCo. Admin</span>
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
      </hlm-sidebar>
      <main hlmSidebarInset>
        <header class="flex h-12 items-center justify-between px-4">
          <button hlmSidebarTrigger>
            <span class="sr-only">Toggle Sidebar</span>
          </button>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">Admin Panel</span>
          </div>
        </header>
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
      lucideUsers,
      lucideSettings,
      lucideShield,
      lucideUserCheck,
      lucideListChecks,
      lucideDollarSign,
      lucideTrendingUp,
      lucideArchive,
      lucideAlertCircle
    }),
  ],
})
export class Dashboard {
  protected readonly _items = [
    {
      title: 'Dashboard',
      icon: 'lucideBarChart3',
      defaultOpen: true,
      items: [
        { title: 'Overview', icon: 'lucideBarChart3' },
        { title: 'System Health', icon: 'lucideTrendingUp' },
        { title: 'Recent Activity', icon: 'lucideHistory' },
      ],
    },
    {
      title: 'Project Management',
      icon: 'lucideFolderOpen',
      defaultOpen: false,
      items: [
        { title: 'Create New Project', icon: 'lucidePlus' },
        { title: 'All Projects', icon: 'lucideFolderOpen' },
        { title: 'Active Projects', icon: 'lucideTrendingUp' },
        { title: 'Pending Approval', icon: 'lucideAlertCircle' },
        { title: 'Archived Projects', icon: 'lucideArchive' },
        { title: 'Project Categories', icon: 'lucideListChecks' },
      ],
    },
    {
      title: 'User Management',
      icon: 'lucideUsers',
      defaultOpen: false,
      items: [
        { title: 'All Users', icon: 'lucideUsers' },
        { title: 'User Permissions', icon: 'lucideUserCheck' },
        { title: 'User Activity', icon: 'lucideHistory' },
        { title: 'Banned Users', icon: 'lucideShield' },
        { title: 'Invite Users', icon: 'lucidePlus' },
      ],
    },
    {
      title: 'Contributions',
      icon: 'lucideWallet',
      defaultOpen: false,
      items: [
        { title: 'All Contributions', icon: 'lucideDollarSign' },
        { title: 'Pending Contributions', icon: 'lucideAlertCircle' },
        { title: 'Contribution Reports', icon: 'lucideFileText' },
        { title: 'Refund Requests', icon: 'lucideHistory' },
        { title: 'Transaction Logs', icon: 'lucideFileText' },
      ],
    },
    {
      title: 'Financial Management',
      icon: 'lucideDollarSign',
      defaultOpen: false,
      items: [
        { title: 'Revenue Overview', icon: 'lucideBarChart3' },
        { title: 'Withdrawal Requests', icon: 'lucideWallet' },
        { title: 'Tax Reports', icon: 'lucideFileText' },
        { title: 'Financial Statements', icon: 'lucideFileText' },
        { title: 'Payment Gateways', icon: 'lucideSettings' },
      ],
    },
    {
      title: 'Analytics & Reports',
      icon: 'lucideTrendingUp',
      defaultOpen: false,
      items: [
        { title: 'Project Analytics', icon: 'lucideBarChart3' },
        { title: 'User Engagement', icon: 'lucideUsers' },
        { title: 'Financial Reports', icon: 'lucideDollarSign' },
        { title: 'Export Data', icon: 'lucideFileText' },
        { title: 'Custom Reports', icon: 'lucidePlus' },
      ],
    },
    {
      title: 'System Settings',
      icon: 'lucideSettings',
      defaultOpen: false,
      items: [
        { title: 'General Settings', icon: 'lucideSettings' },
        { title: 'Project Settings', icon: 'lucideFolderOpen' },
        { title: 'Payment Settings', icon: 'lucideWallet' },
        { title: 'Email Templates', icon: 'lucideFileText' },
        { title: 'Security Settings', icon: 'lucideShield' },
        { title: 'Backup & Restore', icon: 'lucideArchive' },
      ],
    },
    {
      title: 'Audit Log',
      icon: 'lucideHistory',
      defaultOpen: false,
      items: [
        { title: 'System Logs', icon: 'lucideHistory' },
        { title: 'User Actions', icon: 'lucideUsers' },
        { title: 'Security Events', icon: 'lucideShield' },
        { title: 'Export Logs', icon: 'lucideFileText' },
      ],
    },
  ];
}
