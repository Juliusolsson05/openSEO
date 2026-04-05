'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { OpenSeoLogo } from '@/components/brand/logo'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full bg-white border-b border-neutral-200">
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-6">
        <Link href="/landing" className="flex items-center gap-2">
          <OpenSeoLogo size={22} />
          <span className="text-[14px] font-semibold text-neutral-900">OpenSEO</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/landing" className="text-[13px] text-neutral-600 hover:text-blue-600">Landing</Link>
          <Link href="/example" className="text-[13px] text-neutral-600 hover:text-blue-600">Example</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-[13px] text-blue-600">Sign in</Link>
          <Link href="/register" className="text-[13px] font-semibold text-white px-4 py-[6px] bg-blue-600 rounded-sm">Try OpenSEO free</Link>
        </div>

        <button className="md:hidden text-neutral-600" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-6 py-3 space-y-2">
          <Link href="/landing" className="block text-[13px] text-neutral-600">Landing</Link>
          <Link href="/example" className="block text-[13px] text-neutral-600">Example</Link>
        </div>
      )}
    </header>
  )
}
