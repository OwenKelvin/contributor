import { Directive } from '@angular/core';
import { classes } from '@nyots/ui/utils';

@Directive({
	selector: '[hlmBreadcrumbPage]',
	host: {
		role: 'link',
		'aria-disabled': 'true',
		'aria-current': 'page',
	},
})
export class HlmBreadcrumbPage {
	constructor() {
		classes(() => 'text-foreground font-normal');
	}
}
