import Link from 'next/link'
import type { ComparisonToolData } from '../_lib/types'

interface CompareHeroProps {
  toolA: ComparisonToolData
  toolB: ComparisonToolData
  title: string | null
  updatedAt: Date
}

export function CompareHero({ toolA, toolB, title, updatedAt }: CompareHeroProps) {
  const formattedDate = updatedAt.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <section style={{ padding: '48px 24px 32px', textAlign: 'center' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 24, fontSize: 13, color: '#616161' }}>
        <Link href="/landing/compare" style={{ color: '#0078D4', textDecoration: 'none' }}>
          Compare
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>{toolA.name} vs {toolB.name}</span>
      </nav>

      {/* VS Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
          }}
        >
          {toolA.name}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #002050, #0078D4)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
        >
          VS
        </span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
          }}
        >
          {toolB.name}
        </span>
      </div>

      {/* Title */}
      {title && (
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: '0 0 12px',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
      )}

      {/* Meta */}
      <p style={{ fontSize: 13, color: '#616161', margin: 0 }}>
        Last updated {formattedDate}
      </p>
    </section>
  )
}
