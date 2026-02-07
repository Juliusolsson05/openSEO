'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { getSession, signIn, signOut, useSession } from 'next-auth/react'

export const USER_TYPES = {
  Demo: 1,
  Client: 2,
  Agency: 3,
  Administrator: 4,
} as const

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES]

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  userType: number | null
  companyId: number | null
  company?: { id: number | string; name: string | null; [key: string]: unknown } | null
}

interface AuthState {
  userData: AuthUser | null
  userAbilityRules: string[]
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<AuthUser | null>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

function getAbilityRules(userType: number | null | undefined): string[] {
  switch (userType) {
    case USER_TYPES.Administrator:
      return ['manage:all']
    case USER_TYPES.Agency:
      return ['read:dashboard', 'manage:campaigns', 'manage:reports']
    case USER_TYPES.Client:
      return ['read:dashboard', 'read:reports']
    case USER_TYPES.Demo:
      return ['read:dashboard']
    default:
      return []
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  userData: null,
  userAbilityRules: [],
  isAuthenticated: false,

  login: async (email, password) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (!result || result.error) {
      throw new Error(result?.error || 'Invalid credentials')
    }

    const session = await getSession()

    if (!session?.user) {
      return null
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.name,
      userType: session.user.userType,
      companyId: session.user.companyId,
      company: session.user.company,
    }

    set({
      userData: user,
      isAuthenticated: true,
      userAbilityRules: getAbilityRules(user.userType),
    })

    return user
  },

  logout: async () => {
    await signOut({ redirect: false })
    set({ userData: null, userAbilityRules: [], isAuthenticated: false })
  },

  setUser: (user) =>
    set({
      userData: user,
      isAuthenticated: !!user,
      userAbilityRules: getAbilityRules(user?.userType),
    }),
}))

export function useAuthSessionSync() {
  const { data: session, status } = useSession()
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      setUser(null)
      return
    }

    setUser({
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.name,
      userType: session.user.userType,
      companyId: session.user.companyId,
      company: session.user.company,
    })
  }, [session, setUser, status])
}
