import { Injectable, inject } from '@angular/core';
import { HlmAlertDialog } from '@nyots/ui/alert-dialog';
import { HlmDialogService } from '@nyots/ui/dialog';
import { firstValueFrom } from 'rxjs';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Service for displaying confirmation dialogs using Spartan UI Alert Dialog.
 * Provides a consistent way to ask for user confirmation before destructive actions.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private alertDialogService = inject(HlmDialogService);

  /**
   * Show a confirmation dialog and return a promise that resolves to true if confirmed, false if cancelled.
   *
   * @param options - Configuration for the confirmation dialog
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  async confirm(options: ConfirmationOptions): Promise<boolean> {
    const {
      title,
      description,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'default',
    } = options;

    // Create the alert dialog component
    const dialogRef = this.alertDialogService.open(HlmAlertDialog, {
      context: {
        title,
        description,
        confirmText,
        cancelText,
        variant,
      },
    });

    // Wait for the dialog to close and return the result
    try {
      const result = await firstValueFrom(dialogRef.closed$);
      return result === true;
    } catch {
      // If the dialog is dismissed without a result, treat it as cancelled
      return false;
    }
  }

  /**
   * Show a destructive confirmation dialog (red confirm button).
   * Useful for delete, refund, or other irreversible actions.
   */
  async confirmDestructive(options: Omit<ConfirmationOptions, 'variant'>): Promise<boolean> {
    return this.confirm({
      ...options,
      variant: 'destructive',
    });
  }
}
