import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis } from '@ng-icons/lucide';
import { classes } from '@nyots/ui/utils';
import { HlmIcon } from '@nyots/ui/icon';

@Component({
  selector: 'hlm-pagination-ellipsis',
  imports: [HlmIcon, NgIcon],
  providers: [provideIcons({ lucideEllipsis })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-slot': 'pagination-ellipsis',
  },
  template: `
    <span aria-hidden="true">
      <ng-icon hlm size="sm" name="lucideEllipsis" />
      <span class="sr-only">{{ srOnlyText() }}</span>
    </span>
  `,
})
export class HlmPaginationEllipsis {
  constructor() {
    classes(() => 'flex size-9 items-center justify-center');
  }

  /** Screen reader only text for the ellipsis */
  public readonly srOnlyText = input<string>('More pages');
}
