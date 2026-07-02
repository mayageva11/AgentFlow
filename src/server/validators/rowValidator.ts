import { Row, ValidationResult } from '../types';
import { isValidMonthFormat } from './monthValidator';

const VALID_CATEGORIES = new Set(['life', 'health', 'pension', 'property']);

export function hasRequiredFields(row: Row): boolean {
  return Boolean(row.month && row.policy_id && row.category);
}

export function isValidCategory(category: string): boolean {
  return VALID_CATEGORIES.has(category);
}

export function validateRow(row: Row): ValidationResult {
  if (!hasRequiredFields(row)) return { valid: false, statusCode: 67 };
  if (!isValidMonthFormat(row.month as string)) return { valid: false, statusCode: 70 };
  if (!isValidCategory(row.category as string)) return { valid: false, statusCode: 67 };
  return { valid: true };
}
