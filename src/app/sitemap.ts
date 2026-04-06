import { MetadataRoute } from 'next'
import { getPosts, getDictionary } from '@/server/public-content/data'
import { resolvePublicCompanyId } from '@/server/public-content/company'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4720'

/** Safely import comparison data — may fail if Prisma isn't set up */
async function getComparisonSlugs(): Promise<string[]> {
  return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const companyId = resolvePublicCompanyId()
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

  /* ── Comparison pages (dynamic from Prisma) ── */
  const comparisonPages: MetadataRoute.Sitemap = comparisonSlugs.map((slug) => ({
    url: `${BASE}/landing/compare/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // /site/* content pages require PUBLIC_CONTENT_COMPANY_ID
  if (companyId === null) {
    return [...corePages, ...comparisonPages]
  }

  const posts = await getPosts(companyId)
  const dict = await getDictionary(companyId)
  const words = dict?.words ?? []

  /* ── Blog & Dictionary index pages ── */
  const contentIndexPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/site/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/site/dictionary`, changeFrequency: 'daily', priority: 0.8 },
  ]

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
    ...comparisonPages,
    ...blogPages,
    ...dictPages,
  ]
}
