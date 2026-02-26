import Link from 'next/link'
import type { ComparisonToolData } from '../_lib/types'

interface Props {
  toolA: ComparisonToolData
  toolB: ComparisonToolData
  title: string | null
  updatedAt: Date
}

export function CompareHero({ toolA, toolB, title, updatedAt }: Props) {
  const date = new Date(updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1080, margin: '0 auto', padding: '40px 24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
          <Link href="/landing/compare" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Compare</Link>
          {' / '}
          {toolA.name} vs {toolB.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>{toolA.name}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#0078D4', padding: '3px 10px', background: 'rgba(255,255,255,0.9)', borderRadius: 2 }}>VS</span>
          <span style={{ fontSize: 26, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>{toolB.name}</span>
        </div>

        {title && (
          <h1 style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.65)', margin: '0 auto 8px', maxWidth: 520 }}>
            {title}
          </h1>
        )}

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          Last updated {date} · ~8 min read
        </p>
      </div>
    </section>
  )
}
