'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'

const pageTitles: Record<string, string> = {
  '/blog': 'Blog Posts',
  '/blog/titles': 'Titles',
  '/blog/scheduling': 'Scheduling',
  '/blog/cta': 'Call to Actions',
  '/analytics': 'Analytics',
  '/elements': 'Elements',
  '/dictionary': 'Dictionaries',
  '/settings': 'Settings',
  '/company-profile': 'Company Profile',
  '/publishing': 'Publishing',
}

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (/^\/blog\/[^/]+\/preview/.test(pathname)) return 'Preview'
  if (/^\/blog\/[^/]+/.test(pathname)) return 'Edit Post'
  if (/^\/dictionary\//.test(pathname)) return 'Dictionary'
  return 'Dashboard'
}

export function Topbar() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-4 border-b border-border bg-white px-6">
      {/* Breadcrumb-style title */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-muted-foreground">Aurora</span>
        <span className="text-[13px] text-muted-foreground">/</span>
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          id="global-search"
          placeholder={searchFocused ? 'Type to search...' : 'Search (⌘K)'}
          className="h-8 w-52 rounded-sm border border-border bg-secondary pl-8 pr-3 text-[12px] placeholder:text-muted-foreground/60 focus:w-72 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-200"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Notifications */}
      <button className="relative flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
      </button>
    </header>
  )
}
