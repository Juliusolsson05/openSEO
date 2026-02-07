'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthSessionSync } from '@/stores/auth-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { OnboardingTour } from '@/components/layout/onboarding-tour'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showTour, setShowTour] = useState(false)

  const userId = session?.user?.id

  // Auto-trigger: ?welcome=1 in URL always starts tour (even on refresh)
  // Also fires once after signup via localStorage flag
  useEffect(() => {
    if (!userId) return
    const fromUrl = searchParams.get('welcome') === '1'
    const fromStorage = localStorage.getItem('aurora:show-welcome-tour') === '1'

    if (fromUrl || fromStorage) {
      localStorage.removeItem('aurora:show-welcome-tour')
      localStorage.removeItem(`aurora:onboarding-tour:done:${userId}`)
      const t = setTimeout(() => setShowTour(true), 300)
      return () => clearTimeout(t)
    }
  }, [userId, searchParams])

  // Manual trigger: called from topbar "Take the tour" button
  const startTour = useCallback(() => {
    if (!userId) return
    localStorage.removeItem(`aurora:onboarding-tour:done:${userId}`)
    setShowTour(true)
  }, [userId])

  // Keep Zustand in sync with NextAuth session.
  useAuthSessionSync()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status !== 'authenticated') return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[240px] flex flex-col min-h-screen">
        <Topbar onStartTour={startTour} />
        <main className="flex-1 p-6 lg:p-8">
          <div>{children}</div>
        </main>
      </div>
      {userId ? (
        <OnboardingTour
          userId={userId}
          enabled={showTour}
          onFinish={() => setShowTour(false)}
        />
      ) : null}
    </div>
  )
}
