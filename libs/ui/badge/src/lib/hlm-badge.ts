import { Directive, input } from '@angular/core';
import { classes } from '@nyots/ui/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
	'focus-visible:border-ring focus-visible:ring-ring aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&_ng-icon]:pointer-events-none [&_ng-icon]:size-3',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary border-transparent',
				secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary border-transparent',
				destructive:
					'bg-destructive [a&]:hover:bg-destructive focus-visible:ring-destructive dark:focus-visible:ring-destructive dark:bg-destructive border-transparent text-white',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
	selector: '[hlmBadge]',
	host: {
		'data-slot': 'badge',
	},
})
export class HlmBadge {
	public readonly variant = input<BadgeVariants['variant']>('default');

	constructor() {
		classes(() => badgeVariants({ variant: this.variant() }));
	}
}
