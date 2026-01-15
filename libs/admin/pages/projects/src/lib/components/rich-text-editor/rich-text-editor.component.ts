import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  effect,
  inject,
  ViewChild,
  PLATFORM_ID,
  afterNextRender,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBold,
  lucideItalic,
  lucideList,
  lucideListOrdered,
  lucideLink,
  lucideHeading1,
  lucideHeading2,
  lucideImage,
  lucideLoader2,
} from '@ng-icons/lucide';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface RichTextEditorConfig {
  maxLength?: number;
  placeholder?: string;
  readonly?: boolean;
}

@Component({
  selector: 'nyots-rich-text-editor',
  standalone: true,
  imports: [FormsModule, QuillModule, NgIcon],
  providers: [
    provideIcons({
      lucideBold,
      lucideItalic,
      lucideList,
      lucideListOrdered,
      lucideLink,
      lucideHeading1,
      lucideHeading2,
      lucideImage,
      lucideLoader2,
    }),
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
})
export class RichTextEditorComponent {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  isBrowser = signal(false);

  @Input() set content(value: string) {
    if (value !== this.editorContent()) {
      this.editorContent.set(value);
    }
  }

  @Input() config: RichTextEditorConfig = {
    maxLength: 50000,
    placeholder: 'Enter detailed description...',
    readonly: false,
  };

  @Output() contentChange = new EventEmitter<string>();
  @Output() validationError = new EventEmitter<string>();

  @ViewChild('editor') editorComponent?: QuillEditorComponent;

  editorContent = signal<string>('');
  isImageUploading = signal(false);
  characterCount = signal(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quillModules: any = {};

  constructor() {
    // Check if we're in the browser
    afterNextRender(() => {
      this.isBrowser.set(true);
      this.initializeQuillModules();
    });

    // Watch for content changes and emit
    effect(() => {
      const content = this.editorContent();
      this.contentChange.emit(content);
      this.updateCharacterCount(content);
    });
  }

  private initializeQuillModules() {
    if (isPlatformBrowser(this.platformId)) {
      this.quillModules = {
        toolbar: {
          container: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
          ],
          handlers: {
            image: () => this.imageHandler(),
          },
        },
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onContentChanged(event: any) {
    const content = event.html || '';
    
    // Validate max length
    if (this.config.maxLength && this.getTextLength(content) > this.config.maxLength) {
      this.validationError.emit(
        `Content exceeds maximum length of ${this.config.maxLength} characters`
      );
      return;
    }

    this.editorContent.set(content);
  }

  private updateCharacterCount(html: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.characterCount.set(this.getTextLength(html));
    }
  }

  private getTextLength(html: string): number {
    if (isPlatformBrowser(this.platformId)) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent?.length || 0;
    }
    return 0;
  }

  private async imageHandler() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/webp');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.validationError.emit(
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.validationError.emit('Image size must be less than 5MB');
        return;
      }

      await this.uploadImage(file);
    };
  }

  private async uploadImage(file: File) {
    try {
      this.isImageUploading.set(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await firstValueFrom(
        this.http.post<{ filename: string; url: string }>(
          '/api/files/upload',
          formData
        )
      );

      // Insert image into editor
      const quill = this.editorComponent?.quillEditor;
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', response.url);
        quill.setSelection(range.index + 1, 0);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      this.validationError.emit('Failed to upload image. Please try again.');
    } finally {
      this.isImageUploading.set(false);
    }
  }

  get maxLength(): number {
    return this.config.maxLength || 50000;
  }

  get isReadonly(): boolean {
    return this.config.readonly || false;
  }

  get placeholder(): string {
    return this.config.placeholder || 'Enter detailed description...';
  }
}
