import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Writing Tools Compared — Aurora by Nordtools',
  description:
    'Side-by-side comparisons of AI writing tools. Find the best tool for your content needs.',
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        minHeight: '100vh',
        background: '#fff',
      }}
    >
      {children}
    </div>
  )
}
