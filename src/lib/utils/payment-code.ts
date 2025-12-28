import { customAlphabet } from 'nanoid';

/**
 * Generate a unique payment code for bank transfers
 * Format: HQP-XXXXXX (6 characters, uppercase letters and numbers)
 * Excludes similar characters: 0, O, 1, I to avoid confusion
 */
export function generatePaymentCode(): string {
  // Custom alphabet excluding confusing characters
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, 6);

  return `HQP-${nanoid()}`;
}

/**
 * Validate payment code format
 */
export function isValidPaymentCode(code: string): boolean {
  const pattern = /^HQP-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
  return pattern.test(code);
}

/**
 * Format payment code for display (adds hyphen if missing)
 */
export function formatPaymentCode(code: string): string {
  if (code.startsWith('HQP-')) {
    return code;
  }
  if (code.startsWith('HQP')) {
    return `HQP-${code.slice(3)}`;
  }
  return code;
}
