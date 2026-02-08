import Link from 'next/link'
import { AuroraLogo } from '@/components/brand/logo'
import { ArrowLeft } from 'lucide-react'

const fontFamily = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif"

export function StaticPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col antialiased" style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily }}>
      {/* Nav */}
      <header className="w-full bg-white" style={{ borderBottom: '1px solid #E6E6E6' }}>
        <div className="mx-auto flex h-12 max-w-[720px] items-center justify-between px-6">
          <Link href="/landing" className="flex items-center gap-2">
            <AuroraLogo size={22} />
            <span className="text-[14px] font-semibold" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>Aurora</span>
          </Link>
          <Link
            href="/landing"
            className="flex items-center gap-1.5 text-[13px]"
            style={{ color: '#0078D4' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-[720px] px-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6" style={{ borderTop: '1px solid #E6E6E6' }}>
        <div className="mx-auto max-w-[720px] px-6 flex items-center justify-between">
          <p className="text-[11px]" style={{ color: '#A0A0A0' }}>
            © {new Date().getFullYear()} Nordtools. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/landing/privacy" className="text-[11px]" style={{ color: '#A0A0A0' }}>Privacy</Link>
            <Link href="/landing/terms" className="text-[11px]" style={{ color: '#A0A0A0' }}>Terms</Link>
            <Link href="/landing/cookies" className="text-[11px]" style={{ color: '#A0A0A0' }}>Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
