'use client'

import { getSession, signIn, signOut } from 'next-auth/react'
import { setCookie, deleteCookie, getCookie } from 'cookies-next'
import { store } from './index'
import { setUser, logout } from './slices/authSlice'
import { USER_TYPES } from '@/types/auth'
import type { AuthUser } from '@/types/auth'

/**
 * Login: calls NextAuth signIn, then dispatches setUser to Redux.
 */
export async function login(email: string, password: string): Promise<AuthUser | null> {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  if (!result || result.error) {
    throw new Error(result?.error || 'Invalid credentials')
  }

  const session = await getSession()

  if (!session?.user) return null

  const user: AuthUser = {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name,
    userType: session.user.userType,
    companyId: session.user.companyId,
    company: session.user.company,
  }

  store.dispatch(setUser(user))

  if (user.companyId !== null && user.companyId !== undefined) {
    if (user.userType === USER_TYPES.Administrator) {
      const existing = getCookie('companyId')
      const existingId = existing ? Number(existing) : NaN
      if (!Number.isInteger(existingId) || existingId <= 0) {
        setCookie('companyId', String(user.companyId), {
          sameSite: 'lax',
          secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
          maxAge: 60 * 60 * 24 * 365,
        })
      }
    } else {
      setCookie('companyId', String(user.companyId), {
        sameSite: 'lax',
        secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
        maxAge: 60 * 60 * 24 * 365,
      })
    }
  }

  return user
}

/**
 * Logout: calls NextAuth signOut, then dispatches logout to Redux.
 */
export async function logoutUser(): Promise<void> {
  await signOut({ redirect: false })
  deleteCookie('companyId')
  store.dispatch(logout())
}
