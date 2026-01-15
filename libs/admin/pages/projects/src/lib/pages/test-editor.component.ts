import { Component, signal } from '@angular/core';
import { RichTextEditorComponent } from '../components/rich-text-editor';

@Component({
  selector: 'nyots-test-editor',
  standalone: true,
  imports: [RichTextEditorComponent],
  template: `
    <div class="container mx-auto p-8">
      <div class="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
        <div class="mb-6">
          <h3 class="text-2xl font-semibold">Rich Text Editor Test</h3>
        </div>
        <div>
          <nyots-rich-text-editor
            [content]="editorContent()"
            [config]="editorConfig"
            (contentChange)="onContentChange($event)"
            (validationError)="onValidationError($event)"
          />
          
          @if (validationError()) {
            <div class="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {{ validationError() }}
            </div>
          }
          
          <div class="mt-4">
            <h3 class="text-lg font-semibold mb-2">Output HTML:</h3>
            <pre class="p-4 bg-muted rounded-md overflow-auto max-h-[200px] text-sm">{{ editorContent() }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TestEditorComponent {
  editorContent = signal('<p>Hello, this is a <strong>test</strong> of the rich text editor!</p>');
  validationError = signal<string | null>(null);
  
  editorConfig = {
    maxLength: 5000,
    placeholder: 'Start typing your content here...',
    readonly: false,
  };
  
  onContentChange(content: string) {
    this.editorContent.set(content);
    this.validationError.set(null);
  }
  
  onValidationError(error: string) {
    this.validationError.set(error);
  }
}
