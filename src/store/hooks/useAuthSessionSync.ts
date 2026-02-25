'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { setCookie, deleteCookie, getCookie } from 'cookies-next'
import { useAppDispatch } from '../hooks'
import { setUser } from '../slices/authSlice'
import { USER_TYPES } from '@/types/auth'

/**
 * Syncs NextAuth session → Redux authSlice.
 * Call this once in the dashboard layout.
 */
export function useAuthSessionSync() {
  const { data: session, status } = useSession()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      dispatch(setUser(null))
      deleteCookie('companyId')
      return
    }

    dispatch(
      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name,
        userType: session.user.userType,
        companyId: session.user.companyId,
        company: session.user.company,
      })
    )

    const sessionCompanyId = session.user.companyId
    const isAdmin = session.user.userType === USER_TYPES.Administrator
    const cookieCompanyIdRaw = getCookie('companyId')
    const cookieCompanyId = cookieCompanyIdRaw ? Number(cookieCompanyIdRaw) : null

    // Keep admin company switch sticky across refreshes
    if (isAdmin && cookieCompanyId && Number.isInteger(cookieCompanyId) && cookieCompanyId > 0) {
      return
    }

    if (sessionCompanyId !== null && sessionCompanyId !== undefined) {
      setCookie('companyId', String(sessionCompanyId), {
        sameSite: 'lax',
        secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
        maxAge: 60 * 60 * 24 * 365,
      })
    }
  }, [session, status, dispatch])
}
