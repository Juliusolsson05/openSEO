import { EXAMPLE_DICTIONARY, EXAMPLE_POSTS } from '@/app/example/_lib/fixtures'
import { getSyncedDictionaries, getSyncedPosts } from './store'
import type { PublicPost } from './types'

function getCompanyId(): number {
  const raw = process.env.PUBLIC_CONTENT_COMPANY_ID ?? process.env.EXAMPLE_COMPANY_ID ?? '1'
  return parseInt(raw, 10)
}

function fixturesEnabled(): boolean {
  const v = process.env.PUBLIC_CONTENT_USE_FIXTURES
  if (v != null) return v !== 'false'
  return process.env.EXAMPLE_USE_FIXTURES !== 'false'
}

export async function getAllPosts(): Promise<PublicPost[]> {
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
