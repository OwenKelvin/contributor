import { Directive } from '@angular/core';
import { provideHlmIconConfig } from '@nyots/ui/icon';

@Directive({
	selector: '[hlmAlertIcon]',
	providers: [provideHlmIconConfig({ size: 'sm' })],
})
export class HlmAlertIcon {}
