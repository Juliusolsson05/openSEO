import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { AuroraLogo } from '@/components/brand/logo'
import { getComparisonBySlug } from '../_lib/data'
import { CompareHero } from '../_components/CompareHero'
import { ComparisonElementRenderer } from '../_components/ComparisonElementRenderer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const comparison = await getComparisonBySlug(slug)

  if (!comparison) return {}

  return {
    title: comparison.title || `${comparison.tool_a.name} vs ${comparison.tool_b.name}`,
    description:
      comparison.meta_description ||
      `Compare ${comparison.tool_a.name} and ${comparison.tool_b.name} — features, pricing, and more.`,
  }
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params
  const comparison = await getComparisonBySlug(slug)

  if (!comparison) {
    notFound()
  }

  const { tool_a: toolA, tool_b: toolB, elements } = comparison

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
          <Link href="/landing/compare" style={{ fontSize: 13, color: '#0078D4', textDecoration: 'none' }}>
            ← All comparisons
          </Link>
        </div>
      </header>

      {/* Hero */}
      <CompareHero
        toolA={toolA}
        toolB={toolB}
        title={comparison.title}
        updatedAt={comparison.updated_at}
      />

      {/* Content */}
      <main
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 24px 64px',
        }}
      >
        {elements.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: '#616161',
              fontSize: 15,
            }}
          >
            <p>This comparison is being written. Check back soon.</p>
          </div>
        ) : (
          elements.map((element) => (
            <ComparisonElementRenderer
              key={element.id}
              element={element}
              toolA={toolA}
              toolB={toolB}
            />
          ))
        )}
      </main>
    </>
  )
}
