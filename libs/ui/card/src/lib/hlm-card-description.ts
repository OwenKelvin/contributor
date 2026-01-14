import { Directive } from '@angular/core';
import { classes } from '@nyots/ui/utils';

@Directive({
	selector: '[hlmCardDescription]',
})
export class HlmCardDescription {
	constructor() {
		classes(() => 'text-muted-foreground text-sm');
	}
}
