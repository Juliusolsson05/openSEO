'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'

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
    items: [
      { title: 'Blog posts', href: '/blog', icon: FileText },
      { title: 'Blog titles', href: '/blog/titles', icon: Heading },
      { title: 'Blog scheduling', href: '/blog/scheduling', icon: CalendarDays },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        children: [
          { title: 'All Settings', href: '/settings', icon: Settings },
          { title: 'Company Profile', href: '/company-profile', icon: Building2 },
          { title: 'Publishing', href: '/publishing', icon: Upload },
        ],
      },
    ],
  },
  {
    heading: 'Content Extensions',
    items: [
      { title: 'Elements', href: '/elements', icon: Layers },
      { title: 'Dictionaries', href: '/dictionary', icon: BookOpen },
    ],
  },
  {
    heading: 'Extensions',
    items: [
      { title: 'Call To Actions', href: '/blog/cta', icon: Target },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-xl font-bold uppercase tracking-wide">Aurora</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="space-y-4 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {navigation.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.heading}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                if (item.children) {
                  return (
                    <li key={item.href}>
                      <details className="group" open={item.children.some((c) => pathname === c.href)}>
                        <summary className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </summary>
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon
                            const childActive = pathname === child.href
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                    childActive
                                      ? 'bg-primary text-primary-foreground'
                                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                  )}
                                >
                                  <ChildIcon className="h-4 w-4" />
                                  {child.title}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </details>
                    </li>
                  )
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
