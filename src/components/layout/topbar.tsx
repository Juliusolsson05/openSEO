'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, FileText, Tags, BookOpen, Package, HelpCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

type GlobalSearchItem = {
  id: string
  type: 'post' | 'title' | 'dictionary' | 'product'
  title: string
  subtitle?: string
  url: string
  updatedAt: string
}

type NotificationFeedItem = {
  id: string
  title: string
  subtitle: string
  createdAt: string
  url: string
  level: 'info' | 'success' | 'warning'
}

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

function relativeTime(value: string) {
  const ts = new Date(value).getTime()
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function resultTypeLabel(type: GlobalSearchItem['type']) {
  if (type === 'post') return 'Posts'
  if (type === 'title') return 'Titles'
  if (type === 'dictionary') return 'Dictionaries'
  return 'Products'
}

function resultTypeIcon(type: GlobalSearchItem['type']) {
  if (type === 'post') return FileText
  if (type === 'title') return Tags
  if (type === 'dictionary') return BookOpen
  return Package
}

const LAST_SEEN_KEY = 'aurora:notifications:lastSeenAt'

export function Topbar({ onStartTour }: { onStartTour?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const title = getPageTitle(pathname)

  const [searchFocused, setSearchFocused] = useState(false)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GlobalSearchItem[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeResultIndex, setActiveResultIndex] = useState(0)

  const [notifications, setNotifications] = useState<NotificationFeedItem[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const searchBoxRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const run = async () => {
      const trimmed = query.trim()
      if (!trimmed) {
        setSearchResults([])
        setActiveResultIndex(0)
        return
      }

      const { data } = await api<GlobalSearchItem[] | { data: GlobalSearchItem[] }>('/api/v1/search/global', {
        params: { q: trimmed, limit: 10 },
      })
      const items = Array.isArray(data) ? data : (data?.data ?? [])
      setSearchResults(items)
      setActiveResultIndex(0)
    }

    const timeout = setTimeout(run, 180)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const run = async () => {
      const { data } = await api<NotificationFeedItem[] | { data: NotificationFeedItem[] }>('/api/v1/notifications', {
        params: { limit: 20 },
      })
      const items = Array.isArray(data) ? data : (data?.data ?? [])
      setNotifications(items)
    }

    run()
    const interval = setInterval(run, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) setSearchOpen(false)
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setNotificationsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const groupedSearchResults = useMemo(() => {
    return searchResults.reduce<Record<string, GlobalSearchItem[]>>((acc, item) => {
      const key = resultTypeLabel(item.type)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  }, [searchResults])

  const flatSearchResults = useMemo(() => Object.values(groupedSearchResults).flat(), [groupedSearchResults])

  const unreadCount = useMemo(() => {
    const lastSeenAtRaw = typeof window !== 'undefined' ? localStorage.getItem(LAST_SEEN_KEY) : null
    const lastSeenAt = lastSeenAtRaw ? new Date(lastSeenAtRaw).getTime() : 0
    return notifications.filter((n) => new Date(n.createdAt).getTime() > lastSeenAt).length
  }, [notifications])

  const handleSearchEnter = () => {
    const trimmed = query.trim()
    if (!trimmed) return

    const selected = flatSearchResults[activeResultIndex] ?? flatSearchResults[0]
    if (selected) {
      router.push(selected.url)
      setSearchOpen(false)
      setQuery('')
      setActiveResultIndex(0)
      return
    }

    router.push(`/blog?search=${encodeURIComponent(trimmed)}`)
    setSearchOpen(false)
  }

  const openNotifications = () => {
    setNotificationsOpen((prev) => !prev)
    if (!notificationsOpen) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString())
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-4 border-b border-border bg-white px-6">
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-muted-foreground">Aurora</span>
        <span className="text-[13px] text-muted-foreground">/</span>
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
      </div>

      <div className="flex-1" />

      <div ref={searchBoxRef} className="relative" data-tour="topbar-search">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          id="global-search"
          value={query}
          placeholder={searchFocused ? 'Type to search posts, titles, dictionaries...' : 'Search (⌘K)'}
          className="h-8 w-56 rounded-sm border border-border bg-secondary pl-8 pr-3 text-[12px] placeholder:text-muted-foreground/60 focus:w-80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-200"
          onFocus={() => {
            setSearchFocused(true)
            setSearchOpen(true)
          }}
          onBlur={() => setSearchFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearchEnter()
              return
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              if (flatSearchResults.length > 0) {
                setActiveResultIndex((prev) => (prev + 1) % flatSearchResults.length)
              }
              return
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              if (flatSearchResults.length > 0) {
                setActiveResultIndex((prev) => (prev - 1 + flatSearchResults.length) % flatSearchResults.length)
              }
              return
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              setSearchOpen(false)
            }
          }}
        />

        {searchOpen && query.trim() ? (
          <div className="absolute right-0 top-10 z-50 w-[34rem] overflow-hidden rounded-lg border border-border bg-white shadow-xl">
            <div className="border-b border-border bg-secondary/40 px-3 py-2">
              <p className="text-[11px] font-medium text-muted-foreground">Global Search</p>
            </div>

            {flatSearchResults.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground">No matches for “{query.trim()}”.</p>
            ) : (
              <div className="max-h-96 overflow-auto p-2">
                {Object.entries(groupedSearchResults).map(([group, items]) => (
                  <div key={group} className="mb-2 last:mb-0">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
                    {items.map((result) => {
                      const idx = flatSearchResults.findIndex((r) => r.id === result.id)
                      const isActive = idx === activeResultIndex
                      const TypeIcon = resultTypeIcon(result.type)

                      return (
                        <Button
                          key={result.id}
                          type="button"
                          variant="ghost"
                          className={`mb-1 flex h-auto w-full items-start justify-between rounded-md px-2 py-2 text-left ${isActive ? 'bg-secondary' : ''}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setActiveResultIndex(idx)}
                          onClick={() => {
                            router.push(result.url)
                            setSearchOpen(false)
                            setQuery('')
                            setActiveResultIndex(0)
                          }}
                        >
                          <div className="flex min-w-0 items-start gap-2">
                            <TypeIcon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground">{result.title}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{result.subtitle || result.type}</p>
                            </div>
                          </div>
                          <span className="ml-3 shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">{relativeTime(result.updatedAt)}</span>
                        </Button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {onStartTour ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onStartTour}
          className="h-8 w-8 rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Take the tour"
          title="Take the tour"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      ) : null}

      <div ref={notificationsRef} className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={openNotifications}
          className="relative h-8 w-8 rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" /> : null}
        </Button>

        {notificationsOpen ? (
          <div className="absolute right-0 top-10 z-50 w-96 rounded-md border border-border bg-white p-2 shadow-lg">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-xs font-semibold">Notifications</p>
              <p className="text-[11px] text-muted-foreground">{notifications.length} items</p>
            </div>
            {notifications.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">No notifications yet.</p>
            ) : (
              <div className="max-h-96 overflow-auto">
                {notifications.map((notification) => (
                  <Button
                    key={notification.id}
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-sm px-2 py-2 text-left"
                    onClick={() => {
                      router.push(notification.url)
                      setNotificationsOpen(false)
                    }}
                  >
                    <div>
                      <p className="text-xs font-semibold">{notification.title}</p>
                      <p className="text-[11px] text-muted-foreground">{notification.subtitle}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{relativeTime(notification.createdAt)}</p>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  )
}
