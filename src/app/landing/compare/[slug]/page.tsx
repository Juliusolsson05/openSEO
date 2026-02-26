import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
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
    description: comparison.meta_description || `Compare ${comparison.tool_a.name} and ${comparison.tool_b.name} — features, pricing, and more.`,
  }
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params
  const comparison = await getComparisonBySlug(slug)
  if (!comparison) notFound()

  const { tool_a: toolA, tool_b: toolB, elements } = comparison

  return (
    <>


      <CompareHero toolA={toolA} toolB={toolB} title={comparison.title} updatedAt={comparison.updated_at} />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 64px' }}>
        {elements.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '48px 0', color: '#616161', fontSize: 14 }}>
            This comparison is being written. Check back soon.
          </p>
        ) : (
          elements.map((element) => (
            <ComparisonElementRenderer key={element.id} element={element} toolA={toolA} toolB={toolB} />
          ))
        )}
      </main>


    </>
  )
}
