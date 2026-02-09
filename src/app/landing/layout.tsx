import type { Metadata } from 'next'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { CookieConsent } from './_components/CookieConsent'

export const metadata: Metadata = {
  title: 'Aurora by Nordtools — AI-Powered Content at Scale',
  description:
    'Generate SEO-optimized blog posts, dictionaries, and product content — automatically. Built for teams that publish.',
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen antialiased"
      style={{
        background: '#FFFFFF',
        color: '#1A1A1A',
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      }}
    >
      <MarketingHeader />
      <main className="pt-12">{children}</main>
      <MarketingFooter />
      <CookieConsent />
    </div>
  )
}
