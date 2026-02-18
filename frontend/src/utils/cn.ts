import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge Tailwind CSS class names
 * Combines clsx for conditional class handling
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}