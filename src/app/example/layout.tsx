import type { Metadata } from 'next'

import { SiteFooter } from './_components/SiteFooter'
import { SiteHeader } from './_components/SiteHeader'

export const metadata: Metadata = {
  title: 'Awesome SaaS — Ship faster, scale smarter',
  description: 'The all-in-one platform for modern teams.',
  robots: { index: false, follow: false },
}

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <SiteHeader />
      <main className="pt-14">{children}</main>
      <SiteFooter />
    </div>
  )
}
