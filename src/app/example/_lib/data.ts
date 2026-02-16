import { EXAMPLE_DICTIONARY, EXAMPLE_POSTS } from './fixtures'
import { getSyncedDictionaries, getSyncedPosts } from './store'
import type { ExamplePost } from './types'

/**
 * Resolve which company's published content to show.
 * In production, this comes from the domain/subdomain/config.
 */
function getCompanyId(): number {
  return parseInt(process.env.EXAMPLE_COMPANY_ID ?? '1', 10)
}

/**
 * Whether to include fixture (demo) data as fallback.
 * Set EXAMPLE_USE_FIXTURES=false in production to show only real synced content.
 * Default: true (fixtures fill in when DB is empty).
 */
function fixturesEnabled(): boolean {
  return process.env.EXAMPLE_USE_FIXTURES !== 'false'
}

/**
 * Merged data layer.
 *
 * When EXAMPLE_USE_FIXTURES=true (default):
 *   Synced posts override fixtures by slug, fixtures fill the rest.
 *
 * When EXAMPLE_USE_FIXTURES=false (production):
 *   Only synced (DB) content is returned. No demo data.
 */
export async function getAllPosts(): Promise<ExamplePost[]> {
  const companyId = getCompanyId()
  const synced = await getSyncedPosts(companyId)

  if (!fixturesEnabled()) return synced

  const syncedSlugs = new Set(synced.map((p) => p.slug))
  const fixtures = EXAMPLE_POSTS.filter((p) => !syncedSlugs.has(p.slug))
  return [...synced, ...fixtures].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )
}

export async function getPosts() {
  const all = await getAllPosts()
  return all.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image_url: post.cover_image_url,
    cover_image_alt: post.cover_image_alt,
    published_at: post.published_at,
  }))
}

export async function getPost(slug: string) {
  const all = await getAllPosts()
  return all.find((post) => post.slug === slug) ?? null
}

export async function getDictionary() {
  const companyId = getCompanyId()
  const synced = await getSyncedDictionaries(companyId)

  if (synced.length > 0) return synced[0]
  if (!fixturesEnabled()) return { id: '', name: '', description: '', word_count: 0, words: [] }
  return EXAMPLE_DICTIONARY
}

export async function getWord(wordId: string) {
  const dict = await getDictionary()
  return dict.words.find((word) => word.id === wordId) ?? null
}
