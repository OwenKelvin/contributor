import {
  Component,
  signal,
  inject,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field, FieldTree } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLoader2,
  lucideUpload,
  lucideX,
  lucideCalendar,
  lucideImage,
} from '@ng-icons/lucide';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import {
  HlmSelect, HlmSelectContent, HlmSelectOption, HlmSelectTrigger, HlmSelectValue

} from '@nyots/ui/select';
import { RichTextEditorComponent } from '../rich-text-editor/rich-text-editor.component';
import { ICategory, IProjectStatus } from '@nyots/data-source';
import { HlmFormField } from '@nyots/ui/form-field';

export interface ProjectFormModel {
  title: string;
  description: string;
  goalAmount: number;
  startDate: Date | null;
  endDate: Date | null;
  categoryId: string;
  featuredImage: string | null;
  detailedDescription: string;
  status: IProjectStatus;
}

@Component({
  selector: 'nyots-project-form',
  standalone: true,
  imports: [
    CommonModule,
    Field,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmIcon,
    NgIcon,
    BrnSelectImports,
    RichTextEditorComponent,
    HlmSelect,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmSelectOption,
    HlmSelectContent,
    HlmFormField,
  ],
  providers: [
    provideIcons({
      lucideLoader2,
      lucideUpload,
      lucideX,
      lucideCalendar,
      lucideImage,
    }),
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent {
  private http = inject(HttpClient);

  // Inputs using new signal-based API
  projectForm = input.required<FieldTree<ProjectFormModel>>();
  isLoading = input<boolean>(false);
  submitLabel = input<string>('Create Project');
  categories = input<ICategory[]>([]);

  // Output using new signal-based API
  formSubmit = output<void>();

  // File upload state
  isImageUploading = signal(false);
  imagePreviewUrl = signal<string | null>(null);
  uploadProgress = signal(0);
  uploadError = signal<string | null>(null);

  // Project status options
  statusOptions = [
    { value: IProjectStatus.Draft, label: 'Draft' },
    { value: IProjectStatus.Active, label: 'Active' },
    { value: IProjectStatus.Pending, label: 'Pending' },
    { value: IProjectStatus.Completed, label: 'Completed' },
    { value: IProjectStatus.Archived, label: 'Archived' },
  ];

  constructor() {
    // Watch for featured image changes to update preview
    effect(() => {
      const form = this.projectForm();
      const featuredImage = form?.featuredImage?.().value();
      if (featuredImage && featuredImage !== this.imagePreviewUrl()) {
        this.imagePreviewUrl.set(featuredImage);
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.formSubmit.emit();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Reset error state
    this.uploadError.set(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError.set(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadError.set('Image size must be less than 5MB');
      return;
    }

    await this.uploadImage(file);
  }

  async uploadImage(file: File) {
    try {
      this.isImageUploading.set(true);
      this.uploadProgress.set(0);

      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (in real implementation, use HttpClient with progress events)
      const progressInterval = setInterval(() => {
        const current = this.uploadProgress();
        if (current < 90) {
          this.uploadProgress.set(current + 10);
        }
      }, 100);

      const response = await firstValueFrom(
        this.http.post<{ filename: string; url: string }>(
          '/api/files/upload',
          formData,
        ),
      );

      clearInterval(progressInterval);
      this.uploadProgress.set(100);

      // Update form field with the uploaded image URL
      this.projectForm().featuredImage().value.set(response.url);
      this.imagePreviewUrl.set(response.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      this.uploadError.set('Failed to upload image. Please try again.');
    } finally {
      this.isImageUploading.set(false);
      this.uploadProgress.set(0);
    }
  }

  removeImage() {
    this.projectForm().featuredImage().value.set(null);
    this.imagePreviewUrl.set(null);
    this.uploadError.set(null);
  }

  triggerFileInput() {
    const fileInput = document.getElementById(
      'featuredImage',
    ) as HTMLInputElement;
    fileInput?.click();
  }

  onDetailedDescriptionChange(content: string) {
    this.projectForm().detailedDescription().value.set(content);
  }

  onDetailedDescriptionError(error: string) {
    console.error('Rich text editor error:', error);
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateChange(field: 'startDate' | 'endDate', event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;

    if (dateValue) {
      const date = new Date(dateValue);
      this.projectForm()[field]().value.set(date);
    } else {
      this.projectForm()[field]().value.set(null);
    }
  }

  get isFormDisabled(): boolean {
    return this.isLoading() || this.isImageUploading();
  }
}
