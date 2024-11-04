import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to locale string with options
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if string is valid base64
 */
export function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
} 