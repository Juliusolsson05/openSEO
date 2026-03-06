import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    template: '%s — OpenSEO',
    default: 'OpenSEO',
  },
  description: 'OpenSEO is a self-hostable AI-powered SEO content platform.',
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
