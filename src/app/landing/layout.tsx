import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aurora by Nordtools — AI-Powered Content at Scale',
  description: 'Generate SEO-optimized blog posts, dictionaries, and product content — automatically. Built for teams that publish.',
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
