'use client'

import Link from 'next/link'
import { Menu, X, Zap } from 'lucide-react'
import { useState } from 'react'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-6">
        <Link href="/example" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-neutral-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          Awesome SaaS
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/example" className="rounded-md px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">Home</Link>
          <Link href="/example/blog" className="rounded-md px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">Blog</Link>
          <Link href="/example/dictionary" className="rounded-md px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">Dictionary</Link>
        </nav>

        <button className="text-neutral-600 md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-neutral-100 bg-white px-6 py-4 md:hidden">
          <div className="space-y-2">
            <Link href="/example" className="block py-1 text-sm text-neutral-600">Home</Link>
            <Link href="/example/blog" className="block py-1 text-sm text-neutral-600">Blog</Link>
            <Link href="/example/dictionary" className="block py-1 text-sm text-neutral-600">Dictionary</Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
