import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    template: '%s — Aurora',
    default: 'Aurora — Nordtools',
  },
  description: 'Aurora Dashboard by Nordtools — AI-powered content engine.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
