'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, Command } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/blog': { title: 'Blog Posts', subtitle: 'Manage your AI-generated content' },
  '/blog/titles': { title: 'Titles', subtitle: 'Review and manage blog titles' },
  '/blog/scheduling': { title: 'Scheduling', subtitle: 'Plan your content calendar' },
  '/blog/cta': { title: 'Call to Actions', subtitle: 'Configure conversion elements' },
  '/analytics': { title: 'Analytics', subtitle: 'Performance insights and metrics' },
  '/elements': { title: 'Elements', subtitle: 'Content building blocks' },
  '/dictionary': { title: 'Dictionaries', subtitle: 'Term definitions and glossaries' },
  '/settings': { title: 'Settings', subtitle: 'Configure your workspace' },
  '/company-profile': { title: 'Company Profile', subtitle: 'Brand identity and details' },
  '/publishing': { title: 'Publishing', subtitle: 'Distribution and integration settings' },
}

function getPageInfo(pathname: string) {
  // Exact match
  if (pageTitles[pathname]) return pageTitles[pathname]
  // Blog post pages
  if (/^\/blog\/[^/]+\/preview/.test(pathname)) return { title: 'Preview', subtitle: 'Blog post preview' }
  if (/^\/blog\/[^/]+/.test(pathname)) return { title: 'Editor', subtitle: 'Edit blog post' }
  // Dictionary pages
  if (/^\/dictionary\//.test(pathname)) return { title: 'Dictionary', subtitle: 'Term details' }
  return { title: 'Dashboard', subtitle: 'Welcome back' }
}

export function Topbar() {
  const pathname = usePathname()
  const { title, subtitle } = getPageInfo(pathname)
  const [searchFocused, setSearchFocused] = useState(false)

  // Keyboard shortcut ⌘K for search
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-6 border-b border-border/60 bg-background/80 backdrop-blur-xl px-6">
      {/* Page title */}
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-foreground leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          id="global-search"
          placeholder="Search..."
          className="h-9 pl-9 pr-12 bg-muted/50 border-border/50 text-sm placeholder:text-muted-foreground/50 focus:bg-background focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {!searchFocused && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5 text-[10px] text-muted-foreground/40 font-medium">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        )}
      </div>

      {/* Notifications */}
      <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <Bell className="h-4 w-4" />
        {/* Notification dot */}
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
      </button>
    </header>
  )
}
