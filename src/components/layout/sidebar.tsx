'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
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
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { AuroraLogo } from '@/components/brand/logo'
import { useState } from 'react'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

interface NavSection {
  heading?: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    heading: 'CONTENT',
    items: [
      { title: 'Blog Posts', href: '/blog', icon: FileText },
      { title: 'Titles', href: '/blog/titles', icon: Heading },
      { title: 'Scheduling', href: '/blog/scheduling', icon: CalendarDays },
      { title: 'Call to Actions', href: '/blog/cta', icon: Target },
    ],
  },
  {
    heading: 'INSIGHTS',
    items: [
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    heading: 'EXTENSIONS',
    items: [
      { title: 'Elements', href: '/elements', icon: Layers },
      { title: 'Dictionaries', href: '/dictionary', icon: BookOpen },
    ],
  },
  {
    heading: 'SETTINGS',
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
        'group relative flex items-center gap-3 px-4 py-[7px] text-[13px] transition-colors',
        isActive
          ? 'bg-sidebar-accent text-white'
          : 'text-sidebar-foreground hover:bg-sidebar-hover'
      )}
    >
      {/* Left accent bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white" />
      )}
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      <span>{item.title}</span>
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
          'group flex w-full items-center gap-3 px-4 py-[7px] text-[13px] transition-colors',
          hasActiveChild
            ? 'text-white'
            : 'text-sidebar-foreground hover:bg-sidebar-hover'
        )}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        <span>{item.title}</span>
        <ChevronDown
          className={cn(
            'ml-auto h-3 w-3 opacity-50 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="bg-[rgba(0,0,0,0.15)]">
          {item.children?.map((child) => (
            <NavLink key={child.href} item={child} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { userData, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col bg-sidebar">
      {/* Logo bar */}
      <div className="flex h-12 items-center gap-2.5 px-4 border-b border-sidebar-border">
        <AuroraLogo size={24} light />
        <span className="text-[15px] font-semibold text-white tracking-tight">
          Aurora
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navigation.map((section, i) => (
          <div key={i} className="mb-1">
            {section.heading && (
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-sidebar-foreground/40">
                {section.heading}
              </p>
            )}
            {section.items.map((item) =>
              item.children ? (
                <NavGroup key={item.href} item={item} pathname={pathname} />
              ) : (
                <NavLink key={item.href} item={item} pathname={pathname} />
              )
            )}
          </div>
        ))}
      </nav>

      {/* User bar */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-[12px] font-semibold text-white uppercase">
            {userData?.email?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white truncate">
              {userData?.username || userData?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">
              {userData?.company?.name || 'Nordtools'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 p-1.5 text-sidebar-foreground/40 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
