import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Generates a UUID v4 string
 * Uses uuid package for more reliable UUID generation
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Validates if a string is a valid UUID (v4)
 * Used to prevent SQL injection and ensure data integrity
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates if a string is safe for database operations
 * Prevents basic SQL injection attempts
 */
export function isSafeString(input: string, maxLength = 1000): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  if (input.length > maxLength) {
    return false;
  }
  
  // Check for common SQL injection patterns
  const dangerousPatterns = [
    /('|(\\\')|;|--|\/\*|\*\/)/i, // Single quotes, semicolons, comments
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i, // SQL keywords
    /(\bor\b|\band\b).*[=<>]/i, // OR/AND with comparison operators
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}
