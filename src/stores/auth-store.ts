/**
 * Auth store — ported from aurora_dashboard/stores/auth.ts
 */

import { create } from 'zustand'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'

export interface AuthUser {
  email: string
  username: string
  user_type?: number | null
  abilityRules?: any[]
  company?: { id: number; name: string } | null
}

interface AuthState {
  userData: AuthUser | null
  userAbilityRules: any[] | null
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<AuthUser | null>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  hydrate: () => void
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const useAuthStore = create<AuthState>((set, get) => ({
  userData: null,
  userAbilityRules: null,
  isAuthenticated: false,

  hydrate: () => {
    // Restore from cookies on client mount
    if (typeof window === 'undefined') return
    try {
      const raw = getCookie('userData')
      if (raw) {
        const user = typeof raw === 'string' ? JSON.parse(raw) : raw
        set({ userData: user, isAuthenticated: true, userAbilityRules: user.abilityRules || [] })
      }
    } catch {
      // ignore parse errors
    }
  },

  login: async (email, password) => {
    // CSRF preflight (ignore if not available)
    try {
      await fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' })
    } catch {}

    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) throw new Error('Invalid credentials')

    const data = await res.json()
    const user: AuthUser = data.user ?? null

    // Persist in cookies (matching Vue version)
    setCookie('userData', JSON.stringify(user), { maxAge: 365 * 24 * 60 * 60 })
    setCookie('companyId', String(user?.company?.id ?? ''), { maxAge: 365 * 24 * 60 * 60 })

    set({
      userData: user,
      isAuthenticated: true,
      userAbilityRules: user?.abilityRules ?? [],
    })

    return user
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      deleteCookie('userData')
      deleteCookie('companyId')
      deleteCookie('userAbilityRules')

      set({
        userData: null,
        isAuthenticated: false,
        userAbilityRules: null,
      })
    }
  },

  setUser: (user) => {
    set({
      userData: user,
      isAuthenticated: !!user,
      userAbilityRules: user?.abilityRules ?? null,
    })
  },
}))
