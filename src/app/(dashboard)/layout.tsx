'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthSessionSync } from '@/stores/auth-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()

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
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <div>{children}</div>
        </main>
      </div>
    </div>
  )
}
