import { MetadataRoute } from 'next'
import { getPosts, getDictionary } from '@/server/public-content/data'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://aurora.nordtools.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  const dict = await getDictionary()
  const words = dict?.words ?? []

  /* ── Static pages ── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/landing`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/site/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/site/dictionary`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/landing/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/landing/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/landing/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/landing/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/landing/cookies`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/landing/compare`, changeFrequency: 'weekly', priority: 0.7 },
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

  return [...staticPages, ...blogPages, ...dictPages]
}
