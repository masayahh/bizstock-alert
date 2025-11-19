/**
 * Comprehensive validation utilities
 * Type-safe validation functions with error messages
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

/**
 * Validate ticker symbol
 */
export const validateTicker = (ticker: string): ValidationResult => {
  const tickerRegex = /^[A-Z0-9]{1,10}$/;

  if (!ticker) {
    return { valid: false, error: 'Ticker is required' };
  }

  if (!tickerRegex.test(ticker.toUpperCase())) {
    return {
      valid: false,
      error: 'Invalid ticker format (alphanumeric, 1-10 chars)',
    };
  }

  return { valid: true };
};

/**
 * Validate phone number (Japanese format)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const phoneRegex = /^0\d{9,10}$/;

  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (!phoneRegex.test(phone.replace(/-/g, ''))) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true };
};

/**
 * Validate URL
 */
export const validateURL = (url: string): ValidationResult => {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate required field
 */
export const validateRequired = (
  value: any,
  fieldName = 'Field',
): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName = 'Field',
): ValidationResult => {
  if (!value || value.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { valid: true };
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName = 'Field',
): ValidationResult => {
  if (value && value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
    };
  }

  return { valid: true };
};

/**
 * Validate number range
 */
export const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName = 'Value',
): ValidationResult => {
  if (value < min || value > max) {
    return {
      valid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { valid: true };
};

/**
 * Validate pattern match
 */
export const validatePattern = (
  value: string,
  pattern: RegExp,
  errorMessage = 'Invalid format',
): ValidationResult => {
  if (!pattern.test(value)) {
    return { valid: false, error: errorMessage };
  }

  return { valid: true };
};

/**
 * Combine multiple validations
 */
export const validate = (
  ...validations: ValidationResult[]
): ValidationResult => {
  for (const validation of validations) {
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
};
