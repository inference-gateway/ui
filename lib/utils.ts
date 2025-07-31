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
