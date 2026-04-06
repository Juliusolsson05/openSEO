'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthSessionSync } from '@/store/hooks/useAuthSessionSync'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { OnboardingTour } from '@/components/layout/onboarding-tour'

/** Separate client component to isolate useSearchParams inside a Suspense boundary */
function WelcomeTourDetector({ userId, onDetected }: { userId: string | undefined; onDetected: () => void }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!userId) return
    const fromUrl = searchParams.get('welcome') === '1'
    const fromStorage = localStorage.getItem('openseo:show-welcome-tour') === '1'

    if (fromUrl || fromStorage) {
      localStorage.removeItem('openseo:show-welcome-tour')
      localStorage.removeItem(`openseo:onboarding-tour:done:${userId}`)
      if (fromUrl) {
        router.replace(pathname)
      }
      const t = setTimeout(onDetected, 300)
      return () => clearTimeout(t)
    }
  }, [userId, searchParams, pathname, router, onDetected])

  return null
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showTour, setShowTour] = useState(false)
  const [setupChecked, setSetupChecked] = useState(false)

  const userId = session?.user?.id

  const startTour = useCallback(() => {
    if (!userId) return
    localStorage.removeItem(`openseo:onboarding-tour:done:${userId}`)
    setShowTour(true)
  }, [userId])

  // Keep Redux in sync with NextAuth session.
  useAuthSessionSync()

  useEffect(() => {
    async function verifySetup() {
      const response = await fetch('/api/setup/status', { cache: 'no-store' })
      const payload = await response.json().catch(() => null)
      if (payload?.data?.complete === false) {
        router.push('/setup')
        return
      }
      setSetupChecked(true)
      if (status === 'unauthenticated') {
        router.push('/login')
      }
    }

    verifySetup()
  }, [status, router])

  if (!setupChecked || status !== 'authenticated') return null

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
