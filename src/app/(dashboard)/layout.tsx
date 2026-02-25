'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthSessionSync } from '@/store/hooks/useAuthSessionSync'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { OnboardingTour } from '@/components/layout/onboarding-tour'

/** Separate client component to isolate useSearchParams inside a Suspense boundary */
function WelcomeTourDetector({ userId, onDetected }: { userId: string | undefined; onDetected: () => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!userId) return
    const fromUrl = searchParams.get('welcome') === '1'
    const fromStorage = localStorage.getItem('aurora:show-welcome-tour') === '1'

    if (fromUrl || fromStorage) {
      localStorage.removeItem('aurora:show-welcome-tour')
      localStorage.removeItem(`aurora:onboarding-tour:done:${userId}`)
      const t = setTimeout(onDetected, 300)
      return () => clearTimeout(t)
    }
  }, [userId, searchParams, onDetected])

  return null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showTour, setShowTour] = useState(false)

  const userId = session?.user?.id

  // Manual trigger: called from topbar "Take the tour" button
  const startTour = useCallback(() => {
    if (!userId) return
    localStorage.removeItem(`aurora:onboarding-tour:done:${userId}`)
    setShowTour(true)
  }, [userId])

  // Keep Redux in sync with NextAuth session.
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
        <>
          <Suspense fallback={null}>
            <WelcomeTourDetector userId={userId} onDetected={() => setShowTour(true)} />
          </Suspense>
          <OnboardingTour
            userId={userId}
            enabled={showTour}
            onFinish={() => setShowTour(false)}
          />
        </>
      ) : null}
    </div>
  )
}
