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
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
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
            height: 52,
            padding: '0 24px',
          }}
        >
          <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <AuroraLogo size={22} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
              Aurora
            </span>
          </Link>
          <Link href="/landing" style={{ fontSize: 13, color: '#0078D4', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to Aurora
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)',
          padding: '72px 24px 64px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.12)',
              marginBottom: 24,
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '0.02em',
            }}
          >
            ⚡ Powered by Aurora AI
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            AI Writing Tools Compared
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              margin: 0,
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}
          >
            Honest, data-driven comparisons to help you pick the perfect AI writing tool for your needs.
          </p>
        </div>
      </section>

      {/* Popular Comparisons */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 4,
              height: 24,
              borderRadius: 2,
              background: '#0078D4',
            }}
          />
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#1A1A1A',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Popular Comparisons
          </h2>
          <span
            style={{
              fontSize: 13,
              color: '#616161',
              background: '#F5F7FA',
              padding: '3px 10px',
              borderRadius: 12,
              fontWeight: 500,
            }}
          >
            {comparisons.length}
          </span>
        </div>

        {comparisons.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#F5F7FA',
              borderRadius: 12,
              color: '#616161',
              fontSize: 15,
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 18 }}>📝</p>
            <p style={{ margin: 0 }}>No comparisons published yet. Check back soon.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            {comparisons.map((comparison) => (
              <MatchupCard key={comparison.id} comparison={comparison} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 24px 48px' }}>
        <div
          style={{
            background: '#F5F7FA',
            borderRadius: 16,
            padding: '40px 32px',
            textAlign: 'center',
            border: '1px solid #E1E1E1',
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#1A1A1A',
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
            }}
          >
            Can&apos;t find the comparison you&apos;re looking for?
          </h3>
          <p
            style={{
              fontSize: 15,
              color: '#616161',
              margin: '0 0 24px',
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}
          >
            Aurora generates complete, structured blog posts — not just comparisons.
            20+ element types, AI enhancement, and built-in CMS publishing.
          </p>
          <Link
            href="/landing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #002050, #0078D4)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,120,212,0.25)',
            }}
          >
            Try Aurora Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #E1E1E1',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/landing"
            style={{ fontSize: 13, color: '#616161', textDecoration: 'none' }}
          >
            Aurora Home
          </Link>
          <span style={{ color: '#E1E1E1' }}>·</span>
          <Link
            href="/landing/compare"
            style={{ fontSize: 13, color: '#616161', textDecoration: 'none' }}
          >
            All Comparisons
          </Link>
          <span style={{ color: '#E1E1E1' }}>·</span>
          <span style={{ fontSize: 13, color: '#999' }}>
            © {new Date().getFullYear()} Nordtools
          </span>
        </div>
      </footer>
    </>
  )
}
