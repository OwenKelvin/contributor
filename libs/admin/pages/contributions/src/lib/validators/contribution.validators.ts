import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ProjectService } from '@nyots/data-source/projects';

/**
 * Validator that ensures the amount is positive and has at most 2 decimal places.
 * This validates Requirements 10.1 (positive decimal with max 2 decimal places).
 */
export function amountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Allow empty values (use required validator separately)
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = Number(value);

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return { invalidAmount: { message: 'Amount must be a valid number' } };
    }

    // Check if positive
    if (numValue <= 0) {
      return { minAmount: { message: 'Amount must be greater than 0' } };
    }

    // Check decimal places (max 2)
    const decimalPart = value.toString().split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      return { 
        maxDecimalPlaces: { 
          message: 'Amount can have at most 2 decimal places' 
        } 
      };
    }

    return null;
  };
}

/**
 * Async validator that checks if a project exists and is active.
 * This validates Requirements 10.2 (project existence and active status).
 * 
 * @param projectService - The project service to use for validation
 * @param debounceTime - Debounce time in milliseconds (default: 300ms)
 */
export function projectExistsValidator(
  projectService: ProjectService,
  debounceTime = 300
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const projectId = control.value;

    // Allow empty values (use required validator separately)
    if (!projectId) {
      return of(null);
    }

    // Debounce the validation to avoid excessive API calls
    return timer(debounceTime).pipe(
      switchMap(() => projectService.getProjectById(projectId)),
      map((project) => {
        if (!project) {
          return { 
            projectNotFound: { 
              message: 'Selected project does not exist' 
            } 
          };
        }

        // Check if project is active
        if (project.status !== 'ACTIVE') {
          return { 
            projectNotActive: { 
              message: 'Selected project is not active and cannot accept contributions' 
            } 
          };
        }

        return null;
      }),
      catchError(() => {
        // If the API call fails, return an error
        return of({ 
          projectValidationError: { 
            message: 'Unable to validate project. Please try again.' 
          } 
        });
      })
    );
  };
}

/**
 * Helper function to get the error message from a form control.
 * This extracts the custom error messages from our validators.
 * 
 * @param control - The form control to get the error message from
 * @returns The error message string, or null if no errors
 */
export function getValidationErrorMessage(control: AbstractControl | null): string | null {
  if (!control || !control.errors) {
    return null;
  }

  const errors = control.errors;

  // Check for custom validator errors with messages
  for (const errorKey of Object.keys(errors)) {
    const error = errors[errorKey];
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message as string;
    }
  }

  // Fallback to standard Angular validators
  if (errors['required']) {
    return 'This field is required';
  }
  if (errors['min']) {
    return `Value must be at least ${errors['min'].min}`;
  }
  if (errors['max']) {
    return `Value must be at most ${errors['max'].max}`;
  }
  if (errors['email']) {
    return 'Please enter a valid email address';
  }
  if (errors['minlength']) {
    return `Must be at least ${errors['minlength'].requiredLength} characters`;
  }
  if (errors['maxlength']) {
    return `Must be at most ${errors['maxlength'].requiredLength} characters`;
  }

  return 'Invalid value';
}
