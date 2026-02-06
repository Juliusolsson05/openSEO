'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  FileText,
  Heading,
  CalendarDays,
  BarChart3,
  Settings,
  Building2,
  Upload,
  Layers,
  BookOpen,
  Target,
  Sparkles,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  children?: NavItem[]
}

interface NavSection {
  heading?: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    heading: 'Content',
    items: [
      { title: 'Blog Posts', href: '/blog', icon: FileText },
      { title: 'Titles', href: '/blog/titles', icon: Heading },
      { title: 'Scheduling', href: '/blog/scheduling', icon: CalendarDays },
      { title: 'Call to Actions', href: '/blog/cta', icon: Target },
    ],
  },
  {
    heading: 'Insights',
    items: [
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    heading: 'Extensions',
    items: [
      { title: 'Elements', href: '/elements', icon: Layers, badge: 'New' },
      { title: 'Dictionaries', href: '/dictionary', icon: BookOpen },
    ],
  },
  {
    heading: 'Configuration',
    items: [
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        children: [
          { title: 'General', href: '/settings', icon: Settings },
          { title: 'Company Profile', href: '/company-profile', icon: Building2 },
          { title: 'Publishing', href: '/publishing', icon: Upload },
        ],
      },
    ],
  },
]

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
        isActive
          ? 'bg-sidebar-accent/15 text-white'
          : 'text-sidebar-foreground hover:bg-white/[0.06] hover:text-white'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-accent"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      <Icon className={cn(
        'h-4 w-4 shrink-0 transition-colors',
        isActive ? 'text-sidebar-accent' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
      )} />

      <span className="truncate">{item.title}</span>

      {item.badge && (
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sidebar-accent/20 text-sidebar-accent">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const hasActiveChild = item.children?.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + '/')
  )
  const [open, setOpen] = useState(hasActiveChild ?? false)
  const Icon = item.icon

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
          hasActiveChild
            ? 'text-white'
            : 'text-sidebar-foreground hover:bg-white/[0.06] hover:text-white'
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors" />
        <span className="truncate">{item.title}</span>
        <ChevronDown className={cn(
          'ml-auto h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform duration-200',
          open && 'rotate-180'
        )} />
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border/50 pl-3">
          {item.children?.map((child) => (
            <NavLink key={child.href} item={child} pathname={pathname} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { userData, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-accent to-purple-500 shadow-lg shadow-sidebar-accent/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-[15px] font-bold text-white tracking-tight">Aurora</span>
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
            by Nordtools
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/30">
                {section.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.children ? (
                  <NavGroup key={item.href} item={item} pathname={pathname} />
                ) : (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section — user + theme */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}

        {/* User */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-muted text-[13px] font-semibold text-white uppercase">
            {userData?.email?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">
              {userData?.username || userData?.email || 'User'}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">
              {userData?.company?.name || userData?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/40 hover:bg-white/[0.06] hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
