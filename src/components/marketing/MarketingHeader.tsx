'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { OpenSeoLogo } from '@/components/brand/logo'

const NAV_ITEMS = [
  { label: 'Product', href: '/landing#features' },
  { label: 'How it works', href: '/landing#how-it-works' },
  { label: 'Compare', href: '/landing/compare' },
  { label: 'Blog', href: '/site/blog' },
  { label: 'Dictionary', href: '/site/dictionary' },
  { label: 'Contact', href: '/landing/contact' },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href.includes('#')) return false
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-white" style={{ borderBottom: '1px solid #E6E6E6' }}>
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-6">
        <Link href="/landing" className="flex items-center gap-2">
          <OpenSeoLogo size={22} />
          <span className="text-[14px] font-semibold" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>
            OpenSEO
          </span>
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-1 text-[13px] transition-colors"
              style={{
                color: isActive(item.href) ? '#0078D4' : '#616161',
                fontWeight: isActive(item.href) ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-[13px]" style={{ color: '#0078D4' }}>
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-[13px] font-semibold text-white px-4 py-[6px]"
            style={{ background: '#0078D4', borderRadius: 2 }}
          >
            Try OpenSEO free
          </Link>
        </div>

        <button className="md:hidden" style={{ color: '#616161' }} onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="bg-white px-6 py-4 md:hidden" style={{ borderTop: '1px solid #E6E6E6' }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-[13px]"
              style={{
                color: isActive(item.href) ? '#0078D4' : '#616161',
                fontWeight: isActive(item.href) ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/login" className="text-[13px] text-center py-2" style={{ color: '#0078D4' }}>
              Sign in
            </Link>
            <Link
              href="/register"
              className="block py-2 text-center text-[13px] font-semibold text-white"
              style={{ background: '#0078D4', borderRadius: 2 }}
            >
              Try OpenSEO free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
