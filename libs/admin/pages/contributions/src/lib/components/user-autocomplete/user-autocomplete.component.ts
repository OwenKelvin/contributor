import { Component, forwardRef, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HlmInput } from '@nyots/ui/input';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX, lucideLoader2 } from '@ng-icons/lucide';
import { IUser } from '@nyots/data-source';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'nyots-user-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInput,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserAutocompleteComponent),
      multi: true,
    },
    provideIcons({
      lucideSearch,
      lucideX,
      lucideLoader2,
    }),
  ],
  template: `
    <div class="relative">
      <div class="relative">
        <ng-icon
          name="lucideSearch"
          size="16"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          hlmInput
          type="text"
          [formControl]="searchControl"
          [placeholder]="placeholder()"
          class="pl-9 pr-9"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [attr.aria-label]="'Search for user'"
          [attr.aria-expanded]="showDropdown()"
          [attr.aria-autocomplete]="'list'"
        />
        @if (loading()) {
          <ng-icon
            name="lucideLoader2"
            size="16"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
          />
        } @else if (selectedUser() && !disabled()) {
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            (click)="clearSelection()"
            [attr.aria-label]="'Clear selection'"
          >
            <ng-icon name="lucideX" size="16" />
          </button>
        }
      </div>

      @if (showDropdown() && filteredUsers().length > 0) {
        <div
          class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto"
          role="listbox"
        >
          @for (user of filteredUsers(); track user.id) {
            <button
              type="button"
              class="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              (click)="selectUser(user)"
              [attr.role]="'option'"
              [attr.aria-selected]="selectedUser()?.id === user.id"
            >
              <div class="font-medium">{{ getUserName(user) }}</div>
              <div class="text-sm text-muted-foreground">{{ user.email }}</div>
            </button>
          }
        </div>
      }

      @if (showDropdown() && filteredUsers().length === 0 && searchControl.value && !loading()) {
        <div
          class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md px-3 py-2 text-sm text-muted-foreground"
        >
          No users found
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class UserAutocompleteComponent implements ControlValueAccessor {
  // Signals
  searchControl = new FormControl('');
  selectedUser = signal<IUser | null>(null);
  filteredUsers = signal<IUser[]>([]);
  showDropdown = signal(false);
  loading = signal(false);
  disabled = signal(false);
  placeholder = signal('Search for user...');

  // Mock users - in real implementation, this would come from a service
  private allUsers = signal<IUser[]>([]);

  // ControlValueAccessor callbacks
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Set up search with debounce
    effect(() => {
      this.searchControl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((searchTerm) => {
          this.filterUsers(searchTerm || '');
        });
    });
  }

  // ControlValueAccessor implementation
  writeValue(userId: string | null): void {
    if (userId) {
      // In real implementation, fetch user by ID
      const user = this.allUsers().find(u => u.id === userId);
      if (user) {
        this.selectedUser.set(user);
        this.searchControl.setValue(this.getUserName(user), { emitEvent: false });
      }
    } else {
      this.selectedUser.set(null);
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  // Component methods
  onFocus(): void {
    this.showDropdown.set(true);
    if (!this.searchControl.value) {
      this.filteredUsers.set(this.allUsers());
    }
  }

  onBlur(): void {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      this.showDropdown.set(false);
      this.onTouched();
    }, 200);
  }

  selectUser(user: IUser): void {
    this.selectedUser.set(user);
    this.searchControl.setValue(this.getUserName(user), { emitEvent: false });
    this.showDropdown.set(false);
    this.onChange(user.id);
  }

  clearSelection(): void {
    this.selectedUser.set(null);
    this.searchControl.setValue('', { emitEvent: false });
    this.onChange(null);
    this.filteredUsers.set(this.allUsers());
  }

  filterUsers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredUsers.set(this.allUsers());
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = this.allUsers().filter(user => {
      const name = this.getUserName(user).toLowerCase();
      const email = user.email.toLowerCase();
      return name.includes(term) || email.includes(term);
    });

    this.filteredUsers.set(filtered);
  }

  getUserName(user: IUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return user.email;
  }

  // Method to set users from parent component
  setUsers(users: IUser[]): void {
    this.allUsers.set(users);
    this.filteredUsers.set(users);
  }
}
