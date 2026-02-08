import type { Metadata } from 'next'
import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'

export const metadata: Metadata = {
  title: 'Aurora Site',
  description: 'Aurora-generated blog and dictionary.',
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />
      <main className="pt-14">{children}</main>
      <SiteFooter />
    </div>
  )
}
