'use client'

import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export function Topbar() {
  const { userData, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9" />
      </div>

      <div className="flex-1" />

      {/* User info + logout */}
      <div className="flex items-center gap-4">
        {userData && (
          <span className="text-sm text-muted-foreground">
            {userData.email}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
