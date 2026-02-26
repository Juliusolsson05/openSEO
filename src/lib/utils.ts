import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

/**
 * Unwrap a paginated or plain-array API response into a typed array.
 * Handles: T[], { data: T[] }, { results: T[] }, { items: T[] }
 */
export function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  const nested = obj.data ?? obj.results ?? obj.items
  return Array.isArray(nested) ? (nested as T[]) : []
}
