import type { Metadata } from 'next'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: 'OpenSEO Blog & Dictionary',
  description: 'OpenSEO-generated blog posts and SEO dictionary.',
  robots: { index: true, follow: true },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
    </div>
  )
}
