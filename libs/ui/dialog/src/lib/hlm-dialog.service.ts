import { BasePortalOutlet, ComponentType } from '@angular/cdk/portal';
import { inject, Service, type TemplateRef } from '@angular/core';
import { type BrnDialogOptions, BrnDialogService, cssClassesToArray } from '@spartan-ng/brain/dialog';
import { HlmDialogContent } from './hlm-dialog-content';
import { hlmDialogOverlayClass } from './hlm-dialog-overlay';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';

export type HlmDialogOptions<DialogContext = unknown> = BrnDialogOptions & {
	contentClass?: string;
	context?: DialogContext;
};

@Service()
export class HlmDialogService {
  private dialog = inject(Dialog);
  private readonly _brnDialogService = inject(BrnDialogService);

  public open(
    component: ComponentType<unknown> | TemplateRef<unknown>,
    options?: Partial<HlmDialogOptions>,
  ) {
    const mergedOptions = {
      ...(options ?? {}),
      backdropClass: cssClassesToArray(
        `${hlmDialogOverlayClass} ${options?.backdropClass ?? ''}`,
      ),
      context: {
        ...(options?.context && typeof options.context === 'object'
          ? options.context
          : {}),
        $component: component,
        $dynamicComponentClass: options?.contentClass,
      },
    };

    return this._brnDialogService.open(
      HlmDialogContent,
      undefined,
      mergedOptions.context,
      mergedOptions,
    );
  }

  public openNew(
    component: ComponentType<unknown>,
    config?:
      | DialogConfig<unknown, DialogRef<unknown, unknown>, BasePortalOutlet>
      | undefined,
  ) {
    return this.dialog.open(component, config);
  }
}
