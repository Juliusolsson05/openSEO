import { EXAMPLE_DICTIONARY, EXAMPLE_POSTS } from '@/app/example/_lib/fixtures'
import { getSyncedDictionaries, getSyncedPosts } from './store'
import type { PublicDictionary, PublicPost } from './types'

/**
 * Options accepted by every public-content read.
 *
 * `includeFixtures` defaults to `false`. Fixtures are demo content and must
 * NEVER be merged into real public routes (`/site/*`, `sitemap.ts`). Only
 * opt in from a surface that is explicitly labelled as a demo/preview.
 */
export type PublicContentOptions = {
  includeFixtures?: boolean
}

const EMPTY_DICTIONARY: PublicDictionary = {
  id: '',
  name: '',
  description: '',
  word_count: 0,
  words: [],
}

export async function getAllPosts(
  companyId: number,
  options: PublicContentOptions = {},
): Promise<PublicPost[]> {
  const synced = await getSyncedPosts(companyId)
  if (!options.includeFixtures) return synced

  const syncedSlugs = new Set(synced.map((p) => p.slug))
  const fixtures = EXAMPLE_POSTS.filter((p) => !syncedSlugs.has(p.slug))
  return [...synced, ...fixtures].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )
}

export async function getPosts(companyId: number, options: PublicContentOptions = {}) {
  const all = await getAllPosts(companyId, options)
  return all.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image_url: post.cover_image_url,
    published_at: post.published_at,
  }))
}

export async function getPost(
  companyId: number,
  slug: string,
  options: PublicContentOptions = {},
) {
  const all = await getAllPosts(companyId, options)
  return all.find((post) => post.slug === slug) ?? null
}

export async function getDictionary(
  companyId: number,
  options: PublicContentOptions = {},
): Promise<PublicDictionary> {
  const synced = await getSyncedDictionaries(companyId)
  if (synced.length > 0) return synced[0]
  if (!options.includeFixtures) return EMPTY_DICTIONARY
  return EXAMPLE_DICTIONARY
}

export async function getWord(
  companyId: number,
  wordId: string,
  options: PublicContentOptions = {},
) {
  const dict = await getDictionary(companyId, options)
  return dict.words.find((word) => word.id === wordId) ?? null
}
