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

  // Rough reading time estimate
  const readingTime = '8'

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)',
        padding: '36px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.02)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          <Link
            href="/landing/compare"
            style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}
          >
            Compare
          </Link>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{toolA.name} vs {toolB.name}</span>
        </nav>

        {/* VS Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {toolA.name.charAt(0)}
            </div>
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              {toolA.name}
            </span>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.25)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.03em',
              flexShrink: 0,
            }}
          >
            VS
          </span>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {toolB.name.charAt(0)}
            </div>
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              {toolB.name}
            </span>
          </div>
        </div>

        {/* Title */}
        {title && (
          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              margin: '0 0 16px',
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {title}
          </h1>
        )}

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <span>Last updated {formattedDate}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>~{readingTime} min read</span>
        </div>
      </div>
    </section>
  )
}
