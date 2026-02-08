import Link from 'next/link'
import { AuroraLogo } from '@/components/brand/logo'
import { getPublishedComparisons } from './_lib/data'
import { MatchupCard } from './_components/MatchupCard'

export default async function ComparePage() {
  const comparisons = await getPublishedComparisons()

  return (
    <>
      {/* Nav */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#fff',
          borderBottom: '1px solid #E6E6E6',
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 48,
            padding: '0 24px',
          }}
        >
          <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <AuroraLogo size={22} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
              Aurora
            </span>
          </Link>
          <Link href="/landing" style={{ fontSize: 13, color: '#0078D4', textDecoration: 'none' }}>
            ← Back to Aurora
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '56px 24px 40px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}
        >
          AI Writing Tools Compared
        </h1>
        <p
          style={{
            fontSize: 16,
            color: '#616161',
            margin: 0,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
          }}
        >
          Honest, side-by-side comparisons to help you pick the right AI writing tool.
        </p>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 64px' }}>
        {comparisons.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#616161', fontSize: 14 }}>
            No comparisons published yet. Check back soon.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {comparisons.map((comparison) => (
              <MatchupCard key={comparison.id} comparison={comparison} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
