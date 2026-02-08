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
  Shield,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { AuroraLogo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  tourId?: string
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
      { title: 'Blog Posts', href: '/blog', icon: FileText, tourId: 'nav-blog-posts' },
      { title: 'Titles', href: '/blog/titles', icon: Heading, tourId: 'nav-titles' },
      { title: 'Scheduling', href: '/blog/scheduling', icon: CalendarDays },
      { title: 'Call to Actions', href: '/blog/cta', icon: Target },
    ],
  },
  {
    heading: 'INSIGHTS',
    items: [
      { title: 'Analytics', href: '/analytics', icon: BarChart3, tourId: 'nav-analytics' },
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
      { title: 'Company Profile', href: '/company-profile', icon: Building2 },
      { title: 'Settings', href: '/settings', icon: Settings, tourId: 'nav-settings' },
      { title: 'Publishing', href: '/publishing', icon: Upload },
    ],
  },
]

function isActiveRoute(href: string, pathname: string) {
  // Prevent /blog from matching /blog/titles, /blog/scheduling, /blog/cta
  if (href === '/blog') {
    // Only mark Blog Posts active for list + single post routes, not subpages like /blog/titles
    return pathname === '/blog' || /^\/blog\/\d+(?:\/preview)?$/.test(pathname)
  }

  // Prevent /settings from matching unrelated settings-like paths
  if (href === '/settings') {
    return pathname === '/settings'
  }

  return pathname === href || pathname.startsWith(href + '/')
}

function NavLink({ item, pathname, nested = false }: { item: NavItem; pathname: string; nested?: boolean }) {
  const isActive = isActiveRoute(item.href, pathname)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      data-tour={item.tourId}
      className={cn(
        'group relative flex items-center gap-3 py-[7px] text-[13px] transition-colors',
        nested ? 'pl-9 pr-4 text-[12px]' : 'px-4',
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

export function Sidebar() {
  const pathname = usePathname()
  const { userData, logout } = useAuthStore()
  const router = useRouter()
  const isAdmin = userData?.userType === 4

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
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        ))}

        {isAdmin ? (
          <div className="mb-1">
            <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-sidebar-foreground/40">
              ADMIN
            </p>
            <NavLink item={{ title: 'Users', href: '/admin/users', icon: Shield }} pathname={pathname} />
            <a
              href="/example"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 py-[7px] px-4 text-[13px] transition-colors text-sidebar-foreground hover:bg-sidebar-hover"
            >
              <ExternalLink className="h-4 w-4 shrink-0 opacity-80" />
              <span>Example Site</span>
            </a>
          </div>
        ) : null}
      </nav>

      {/* User bar */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-[12px] font-semibold text-white uppercase">
            {userData?.email?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white truncate">
              {userData?.name || userData?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">
              {userData?.company?.name || 'Nordtools'}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-auto w-auto shrink-0 p-1.5 text-sidebar-foreground/40 hover:bg-transparent hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
