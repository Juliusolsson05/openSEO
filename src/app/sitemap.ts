import { MetadataRoute } from 'next'
import { getPosts, getDictionary } from '@/server/public-content/data'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://aurora.nordtools.com'

/** Safely import comparison data — may fail if Prisma isn't set up */
async function getComparisonSlugs(): Promise<string[]> {
  try {
    const { getPublishedComparisons } = await import('@/app/landing/compare/_lib/data')
    const comparisons = await getPublishedComparisons()
    return comparisons.map((c) => c.slug)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  const dict = await getDictionary()
  const words = dict?.words ?? []
  const comparisonSlugs = await getComparisonSlugs()

  /* ── Core pages ── */
  const corePages: MetadataRoute.Sitemap = [
    { url: `${BASE}/landing`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/landing/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/landing/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/landing/compare`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/landing/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/landing/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/landing/cookies`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  /* ── Blog & Dictionary index pages ── */
  const contentIndexPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/site/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/site/dictionary`, changeFrequency: 'daily', priority: 0.8 },
  ]

  /* ── Example pages ── */
  const examplePages: MetadataRoute.Sitemap = [
    { url: `${BASE}/example`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/example/blog`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/example/dictionary`, changeFrequency: 'weekly', priority: 0.5 },
  ]

  /* ── Comparison pages (dynamic from Prisma) ── */
  const comparisonPages: MetadataRoute.Sitemap = comparisonSlugs.map((slug) => ({
    url: `${BASE}/landing/compare/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  /* ── Blog posts ── */
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/site/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  /* ── Dictionary words ── */
  const dictPages: MetadataRoute.Sitemap = words.map((word) => ({
    url: `${BASE}/site/dictionary/${word.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    ...corePages,
    ...contentIndexPages,
    ...examplePages,
    ...comparisonPages,
    ...blogPages,
    ...dictPages,
  ]
}
