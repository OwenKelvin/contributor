import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { ProjectFormComponent, ProjectFormModel } from './project-form.component';
import { IProjectStatus } from '@nyots/data-source';

describe('ProjectFormComponent - File Validation', () => {
  let component: ProjectFormComponent;
  let fixture: ComponentFixture<ProjectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectFormComponent);
    component = fixture.componentInstance;

    // Create a mock form for testing
    const mockModel = signal<ProjectFormModel>({
      title: '',
      description: '',
      goalAmount: 0,
      startDate: null,
      endDate: null,
      categoryId: '',
      featuredImage: null,
      detailedDescription: '',
      status: IProjectStatus.Draft,
    });

    const mockForm = form(mockModel, () => {});
    
    // Set the input using the new signal-based API
    fixture.componentRef.setInput('projectForm', mockForm);
    fixture.componentRef.setInput('categories', []);
    
    fixture.detectChanges();
  });

  describe('File Type Validation (Requirement 12.6)', () => {
    it('should reject invalid file types', () => {
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const event = {
        target: {
          files: [invalidFile]
        }
      } as any;

      component.onFileSelected(event);

      expect(component.uploadError()).toBe(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      );
    });

    it('should accept JPEG files', () => {
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const event = {
        target: {
          files: [validFile]
        }
      } as any;

      // Spy on uploadImage to prevent actual upload
      spyOn(component, 'uploadImage' as any).and.returnValue(Promise.resolve());

      component.onFileSelected(event);

      expect(component.uploadError()).toBeNull();
    });

    it('should accept PNG files', () => {
      const validFile = new File(['content'], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [validFile]
        }
      } as any;

      spyOn(component, 'uploadImage' as any).and.returnValue(Promise.resolve());

      component.onFileSelected(event);

      expect(component.uploadError()).toBeNull();
    });

    it('should accept WebP files', () => {
      const validFile = new File(['content'], 'test.webp', { type: 'image/webp' });
      const event = {
        target: {
          files: [validFile]
        }
      } as any;

      spyOn(component, 'uploadImage' as any).and.returnValue(Promise.resolve());

      component.onFileSelected(event);

      expect(component.uploadError()).toBeNull();
    });

    it('should reject GIF files', () => {
      const invalidFile = new File(['content'], 'test.gif', { type: 'image/gif' });
      const event = {
        target: {
          files: [invalidFile]
        }
      } as any;

      component.onFileSelected(event);

      expect(component.uploadError()).toBe(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      );
    });

    it('should reject SVG files', () => {
      const invalidFile = new File(['content'], 'test.svg', { type: 'image/svg+xml' });
      const event = {
        target: {
          files: [invalidFile]
        }
      } as any;

      component.onFileSelected(event);

      expect(component.uploadError()).toBe(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      );
    });
  });

  describe('File Size Validation (Requirement 12.7)', () => {
    it('should reject files larger than 5MB', () => {
      // Create a file larger than 5MB (5 * 1024 * 1024 bytes)
      const largeSize = 6 * 1024 * 1024; // 6MB
      const largeFile = new File(['x'.repeat(largeSize)], 'large.jpg', { type: 'image/jpeg' });
      
      // Mock the size property
      Object.defineProperty(largeFile, 'size', { value: largeSize });

      const event = {
        target: {
          files: [largeFile]
        }
      } as any;

      component.onFileSelected(event);

      expect(component.uploadError()).toBe('Image size must be less than 5MB');
    });

    it('should accept files exactly 5MB', () => {
      const exactSize = 5 * 1024 * 1024; // Exactly 5MB
      const validFile = new File(['x'.repeat(exactSize)], 'valid.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(validFile, 'size', { value: exactSize });

      const event = {
        target: {
          files: [validFile]
        }
      } as any;

      spyOn(component, 'uploadImage' as any).and.returnValue(Promise.resolve());

      component.onFileSelected(event);

      expect(component.uploadError()).toBeNull();
    });

    it('should accept files smaller than 5MB', () => {
      const smallSize = 1 * 1024 * 1024; // 1MB
      const smallFile = new File(['x'.repeat(smallSize)], 'small.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(smallFile, 'size', { value: smallSize });

      const event = {
        target: {
          files: [smallFile]
        }
      } as any;

      spyOn(component, 'uploadImage' as any).and.returnValue(Promise.resolve());

      component.onFileSelected(event);

      expect(component.uploadError()).toBeNull();
    });

    it('should accept very small files', () => {
      const tinySize = 100; // 100 bytes
      const tinyFile = new File(['x'.repeat(tinySize)], 'tiny.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(tinyFile, 'size', { value: tinySize });

      const event = {
        target: {
          files: [tinyFile]
        }
      } as any;

      spyOn(component, 'uploadImage' as any).and.returnValue(Promise.resolve());

      component.onFileSelected(event);

      expect(component.uploadError()).toBeNull();
    });
  });

  describe('Combined File Validation', () => {
    it('should validate both type and size', () => {
      // Invalid type but valid size
      const invalidTypeFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(invalidTypeFile, 'size', { value: 1024 });

      const event1 = {
        target: {
          files: [invalidTypeFile]
        }
      } as any;

      component.onFileSelected(event1);
      expect(component.uploadError()).toBe(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      );

      // Valid type but invalid size
      const largeSize = 6 * 1024 * 1024;
      const invalidSizeFile = new File(['x'.repeat(largeSize)], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(invalidSizeFile, 'size', { value: largeSize });

      const event2 = {
        target: {
          files: [invalidSizeFile]
        }
      } as any;

      component.onFileSelected(event2);
      expect(component.uploadError()).toBe('Image size must be less than 5MB');
    });

    it('should reset error state when selecting a new file', () => {
      // First, trigger an error
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const event1 = {
        target: {
          files: [invalidFile]
        }
      } as any;

      component.onFileSelected(event1);
      expect(component.uploadError()).not.toBeNull();

      // Then select a valid file
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 });
      
      const event2 = {
        target: {
          files: [validFile]
        }
      } as any;

      spyOn(component, 'uploadImage' as any).and.returnValue(Promise.resolve());

      component.onFileSelected(event2);
      expect(component.uploadError()).toBeNull();
    });
  });

  describe('Error Message Display (Requirement 12.9)', () => {
    it('should display specific error message for invalid file type', () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = {
        target: {
          files: [invalidFile]
        }
      } as any;

      component.onFileSelected(event);

      const errorMessage = component.uploadError();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).toContain('Invalid file type');
      expect(errorMessage).toContain('JPEG, PNG, and WebP');
    });

    it('should display specific error message for file size', () => {
      const largeSize = 10 * 1024 * 1024;
      const largeFile = new File(['x'.repeat(largeSize)], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: largeSize });

      const event = {
        target: {
          files: [largeFile]
        }
      } as any;

      component.onFileSelected(event);

      const errorMessage = component.uploadError();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).toContain('5MB');
    });
  });
});
