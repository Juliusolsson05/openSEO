/**
 * Secure cookie helper — ported from aurora_dashboard/composables/useSecureCookie.ts
 * Wraps cookies-next with SameSite=None + Secure defaults.
 */

import { getCookie, setCookie, deleteCookie } from 'cookies-next'

const SECURE_DEFAULTS = {
  sameSite: 'none' as const,
  secure: true,
}

export function useSecureCookie(name: string) {
  const get = (): string | undefined => {
    const value = getCookie(name)
    return value !== undefined ? String(value) : undefined
  }

  const set = (value: string, options: Record<string, unknown> = {}) => {
    setCookie(name, value, { ...SECURE_DEFAULTS, ...options } as any)
  }

  const remove = (options: Record<string, unknown> = {}) => {
    deleteCookie(name, { ...SECURE_DEFAULTS, ...options } as any)
  }

  return { get, set, remove }
}
