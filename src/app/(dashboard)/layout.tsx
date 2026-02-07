'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useAuthSessionSync } from '@/stores/auth-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  // Sync NextAuth session → Zustand store
  useAuthSessionSync()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[240px] flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="animate-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
