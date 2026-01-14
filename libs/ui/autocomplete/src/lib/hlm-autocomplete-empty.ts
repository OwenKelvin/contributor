import { Directive } from '@angular/core';
import { classes } from '@nyots/ui/utils';

@Directive({
	selector: '[hlmAutocompleteEmpty]',
})
export class HlmAutocompleteEmpty {
	constructor() {
		classes(() => 'py-6 text-center text-sm');
	}
}
