import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateProjectComponent } from './create-project.component';
import { ProjectService } from '@nyots/data-source/projects';
import { CategoryService } from '@nyots/data-source/projects';
import { IProjectStatus } from '@nyots/data-source';

describe('CreateProjectComponent - Form Validation', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['createProject']);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getAllCategories']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateProjectComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    projectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock category service to return empty array
    categoryService.getAllCategories.and.returnValue(Promise.resolve([]));

    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Title Validation (Requirement 12.1)', () => {
    it('should require title', () => {
      const titleField = component['projectForm'].title;
      titleField().value.set('');
      titleField().markTouched();
      
      expect(titleField().invalid()).toBe(true);
      const errors = titleField().errors();
      expect(errors.some(e => e.message === 'Title is required')).toBe(true);
    });

    it('should enforce minimum length of 3 characters', () => {
      const titleField = component['projectForm'].title;
      titleField().value.set('ab');
      titleField().markTouched();
      
      expect(titleField().invalid()).toBe(true);
      const errors = titleField().errors();
      expect(errors.some(e => e.message === 'Title must be at least 3 characters')).toBe(true);
    });

    it('should enforce maximum length of 200 characters', () => {
      const titleField = component['projectForm'].title;
      const longTitle = 'a'.repeat(201);
      titleField().value.set(longTitle);
      titleField().markTouched();
      
      expect(titleField().invalid()).toBe(true);
      const errors = titleField().errors();
      expect(errors.some(e => e.message === 'Title must not exceed 200 characters')).toBe(true);
    });

    it('should accept valid title between 3 and 200 characters', () => {
      const titleField = component['projectForm'].title;
      titleField().value.set('Valid Project Title');
      titleField().markTouched();
      
      expect(titleField().invalid()).toBe(false);
    });
  });

  describe('Description Validation (Requirement 12.2)', () => {
    it('should require description', () => {
      const descField = component['projectForm'].description;
      descField().value.set('');
      descField().markTouched();
      
      expect(descField().invalid()).toBe(true);
      const errors = descField().errors();
      expect(errors.some(e => e.message === 'Description is required')).toBe(true);
    });

    it('should enforce minimum length of 10 characters', () => {
      const descField = component['projectForm'].description;
      descField().value.set('short');
      descField().markTouched();
      
      expect(descField().invalid()).toBe(true);
      const errors = descField().errors();
      expect(errors.some(e => e.message === 'Description must be at least 10 characters')).toBe(true);
    });

    it('should accept valid description with 10 or more characters', () => {
      const descField = component['projectForm'].description;
      descField().value.set('This is a valid description');
      descField().markTouched();
      
      expect(descField().invalid()).toBe(false);
    });
  });

  describe('Goal Amount Validation (Requirement 12.3)', () => {
    it('should require goal amount', () => {
      const amountField = component['projectForm'].goalAmount;
      amountField().value.set(0);
      amountField().markTouched();
      
      expect(amountField().invalid()).toBe(true);
      const errors = amountField().errors();
      expect(errors.some(e => e.message === 'Goal amount must be greater than zero')).toBe(true);
    });

    it('should reject negative amounts', () => {
      const amountField = component['projectForm'].goalAmount;
      amountField().value.set(-100);
      amountField().markTouched();
      
      expect(amountField().invalid()).toBe(true);
      const errors = amountField().errors();
      expect(errors.some(e => e.message === 'Goal amount must be greater than zero')).toBe(true);
    });

    it('should enforce maximum 2 decimal places', () => {
      const amountField = component['projectForm'].goalAmount;
      amountField().value.set(100.123);
      amountField().markTouched();
      
      expect(amountField().invalid()).toBe(true);
      const errors = amountField().errors();
      expect(errors.some(e => e.message === 'Goal amount must have at most 2 decimal places')).toBe(true);
    });

    it('should accept valid amount with 0 decimal places', () => {
      const amountField = component['projectForm'].goalAmount;
      amountField().value.set(1000);
      amountField().markTouched();
      
      expect(amountField().invalid()).toBe(false);
    });

    it('should accept valid amount with 1 decimal place', () => {
      const amountField = component['projectForm'].goalAmount;
      amountField().value.set(1000.5);
      amountField().markTouched();
      
      expect(amountField().invalid()).toBe(false);
    });

    it('should accept valid amount with 2 decimal places', () => {
      const amountField = component['projectForm'].goalAmount;
      amountField().value.set(1000.99);
      amountField().markTouched();
      
      expect(amountField().invalid()).toBe(false);
    });
  });

  describe('Date Validation (Requirements 12.4, 12.5)', () => {
    it('should require start date', () => {
      const startDateField = component['projectForm'].startDate;
      startDateField().value.set(null);
      startDateField().markTouched();
      
      expect(startDateField().invalid()).toBe(true);
      const errors = startDateField().errors();
      expect(errors.some(e => e.message === 'Start date is required')).toBe(true);
    });

    it('should require end date', () => {
      const endDateField = component['projectForm'].endDate;
      endDateField().value.set(null);
      endDateField().markTouched();
      
      expect(endDateField().invalid()).toBe(true);
      const errors = endDateField().errors();
      expect(errors.some(e => e.message === 'End date is required')).toBe(true);
    });

    it('should validate that end date is after start date', () => {
      const startDateField = component['projectForm'].startDate;
      const endDateField = component['projectForm'].endDate;
      
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-10'); // Before start date
      
      startDateField().value.set(startDate);
      endDateField().value.set(endDate);
      endDateField().markTouched();
      
      expect(endDateField().invalid()).toBe(true);
      const errors = endDateField().errors();
      expect(errors.some(e => e.message === 'End date must be after start date')).toBe(true);
    });

    it('should reject when end date equals start date', () => {
      const startDateField = component['projectForm'].startDate;
      const endDateField = component['projectForm'].endDate;
      
      const sameDate = new Date('2024-01-15');
      
      startDateField().value.set(sameDate);
      endDateField().value.set(sameDate);
      endDateField().markTouched();
      
      expect(endDateField().invalid()).toBe(true);
      const errors = endDateField().errors();
      expect(errors.some(e => e.message === 'End date must be after start date')).toBe(true);
    });

    it('should accept valid date range', () => {
      const startDateField = component['projectForm'].startDate;
      const endDateField = component['projectForm'].endDate;
      
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-02-15');
      
      startDateField().value.set(startDate);
      endDateField().value.set(endDate);
      endDateField().markTouched();
      
      expect(endDateField().invalid()).toBe(false);
    });
  });

  describe('Category Validation', () => {
    it('should require category', () => {
      const categoryField = component['projectForm'].categoryId;
      categoryField().value.set('');
      categoryField().markTouched();
      
      expect(categoryField().invalid()).toBe(true);
      const errors = categoryField().errors();
      expect(errors.some(e => e.message === 'Category is required')).toBe(true);
    });
  });

  describe('Status Validation', () => {
    it('should require status', () => {
      const statusField = component['projectForm'].status;
      statusField().value.set('' as any);
      statusField().markTouched();
      
      expect(statusField().invalid()).toBe(true);
      const errors = statusField().errors();
      expect(errors.some(e => e.message === 'Status is required')).toBe(true);
    });
  });

  describe('Detailed Description Validation', () => {
    it('should require detailed description', () => {
      const detailedDescField = component['projectForm'].detailedDescription;
      detailedDescField().value.set('');
      detailedDescField().markTouched();
      
      expect(detailedDescField().invalid()).toBe(true);
      const errors = detailedDescField().errors();
      expect(errors.some(e => e.message === 'Detailed description is required')).toBe(true);
    });
  });
});
