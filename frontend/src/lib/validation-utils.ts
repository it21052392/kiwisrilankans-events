/**
 * Utility functions for handling backend validation errors
 */

export interface BackendValidationError {
  field: string;
  fieldName: string;
  message: string;
  code: string;
  received: any;
  expected: any;
  receivedType: string;
  path: string[];
}

export interface BackendErrorResponse {
  success: false;
  message: string;
  errors: BackendValidationError[];
  errorsByField: Record<string, BackendValidationError[]>;
  details: {
    totalErrors: number;
    fields: string[];
    fieldCount: number;
    validationSummary: Array<{
      field: string;
      errorCount: number;
      firstError: string;
    }>;
  };
}

/**
 * Maps backend field names to frontend field names
 */
const FIELD_MAPPING: Record<string, string> = {
  'body.title': 'title',
  'body.description': 'description',
  'body.category': 'category',
  'body.startDate': 'startDate',
  'body.endDate': 'endDate',
  'body.location.name': 'locationName',
  'body.location.address': 'locationAddress',
  'body.location.city': 'locationCity',
  'body.capacity': 'capacity',
  'body.price': 'price',
  'body.contactInfo.name': 'contactName',
  'body.contactInfo.email': 'contactEmail',
  'body.contactInfo.phone': 'contactPhone',
  'body.startTime': 'startTime',
  'body.endTime': 'endTime',
  'body.currency': 'currency',
  'body.tags': 'tags',
  'body.requirements': 'requirements',
};

/**
 * Processes backend validation errors and maps them to frontend field names
 * @param error - The error object from the API
 * @returns Object with mapped errors for frontend form fields
 */
export function processValidationErrors(error: any): {
  frontendErrors: Record<string, string>;
  firstError: string | null;
  hasValidationErrors: boolean;
} {
  const frontendErrors: Record<string, string> = {};
  let firstError: string | null = null;

  if (error?.data?.errorsByField) {
    Object.entries(error.data.errorsByField).forEach(([field, fieldErrors]: [string, any]) => {
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const frontendField = FIELD_MAPPING[field] || field;
        frontendErrors[frontendField] = fieldErrors[0].message;
        
        if (!firstError) {
          firstError = fieldErrors[0].message;
        }
      }
    });
  }

  return {
    frontendErrors,
    firstError,
    hasValidationErrors: Object.keys(frontendErrors).length > 0,
  };
}

/**
 * Gets a user-friendly error message from an API error
 * @param error - The error object from the API
 * @param fallbackMessage - Fallback message if no specific error is found
 * @returns User-friendly error message
 */
export function getErrorMessage(error: any, fallbackMessage: string = 'An error occurred'): string {
  if (error?.data?.message) {
    return error.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return fallbackMessage;
}

/**
 * Checks if an error is a validation error
 * @param error - The error object from the API
 * @returns True if it's a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.data?.errorsByField && Object.keys(error.data.errorsByField).length > 0;
}
