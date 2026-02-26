import Link from 'next/link'
import { AuroraLogo } from '@/components/brand/logo'
import { getPublishedComparisons } from './_lib/data'

export default async function ComparePage() {
  const comparisons = await getPublishedComparisons()

  return (
    <>
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1080, margin: '0 auto', padding: '64px 24px 56px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Compare</p>
          <h1 style={{ fontSize: 36, fontWeight: 600, color: '#FFFFFF', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            AI Writing Tools Compared
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 auto', maxWidth: 440, lineHeight: 1.6 }}>
            Honest, data-driven comparisons to help you pick the right AI writing tool for your needs.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 64px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0078D4', marginBottom: 8 }}>Comparisons</p>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A', letterSpacing: '-0.01em', margin: '0 0 24px' }}>
          {comparisons.length} head-to-head matchups.
        </h2>

        {comparisons.length === 0 ? (
          <p style={{ fontSize: 14, color: '#616161' }}>No comparisons published yet. Check back soon.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#E1E1E1' }}>
            {comparisons.map((c) => (
              <Link
                key={c.id}
                href={`/landing/compare/${c.slug}`}
                style={{ display: 'block', padding: 20, background: '#FFFFFF', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{c.tool_a.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0078D4', padding: '2px 8px', background: '#DEECF9', borderRadius: 2 }}>vs</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{c.tool_b.name}</span>
                </div>
                <p style={{ fontSize: 12, color: '#616161', margin: 0, lineHeight: 1.5 }}>{c.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)', padding: '64px 24px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <AuroraLogo size={40} light />
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#FFFFFF', margin: '20px 0 12px', letterSpacing: '-0.01em' }}>
            Need content, not just comparisons?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 auto 24px', maxWidth: 440 }}>
            Aurora generates complete, structured blog posts — 20+ element types, Autopilot enhancement, and built-in CMS publishing.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#0078D4', background: '#FFFFFF', borderRadius: 2, textDecoration: 'none' }}>
            Try Aurora free →
          </Link>
        </div>
      </section>

    </>
  )
}
