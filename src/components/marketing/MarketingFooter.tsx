import Link from 'next/link'
import { OpenSeoLogo } from '@/components/brand/logo'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/landing#features' },
      { label: 'How it works', href: '/landing#how-it-works' },
      { label: 'Compare tools', href: '/landing/compare' },
      { label: 'Example site', href: '/example' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/site/blog' },
      { label: 'Dictionary', href: '/site/dictionary' },
      { label: 'About', href: '/landing/about' },
      { label: 'Contact', href: '/landing/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/landing/privacy' },
      { label: 'Terms of Service', href: '/landing/terms' },
      { label: 'Cookie Policy', href: '/landing/cookies' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer style={{ borderTop: '1px solid #E6E6E6', background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/landing" className="flex items-center gap-2">
              <OpenSeoLogo size={20} />
              <span className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>
                OpenSEO
              </span>
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed" style={{ color: '#A0A0A0' }}>
              AI-powered content generation.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3"
                style={{ color: '#A0A0A0' }}
              >
                {col.title}
              </p>
              <ul className="space-y-1.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[12px] hover:text-[#0078D4] transition-colors"
                      style={{ color: '#616161' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-8 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ borderTop: '1px solid #E6E6E6' }}
        >
          <p className="text-[11px]" style={{ color: '#A0A0A0' }}>
            © {new Date().getFullYear()} OpenSEO. All rights reserved.
          </p>
          <Link
            href="/sitemap.xml"
            className="text-[11px] hover:text-[#0078D4] transition-colors"
            style={{ color: '#A0A0A0' }}
          >
            Sitemap
          </Link>
        </div>
      </div>
    </footer>
  )
}
