import { EXAMPLE_DICTIONARY, EXAMPLE_POSTS } from './fixtures'
import { getSyncedDictionaries, getSyncedPosts } from './store'
import type { ExamplePost } from './types'

/**
 * Merged data layer.
 *
 * Synced posts (from Aurora webhook) override fixture posts by slug.
 * Fixture posts fill the rest. This means:
 * - Fresh install → shows fixture/demo content
 * - After sync    → shows real Aurora-generated content + remaining fixtures
 */

export function getAllPosts(): ExamplePost[] {
  const synced = getSyncedPosts()
  const syncedSlugs = new Set(synced.map((p) => p.slug))
  const fixtures = EXAMPLE_POSTS.filter((p) => !syncedSlugs.has(p.slug))
  return [...synced, ...fixtures].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )
}

export function getPosts() {
  return getAllPosts().map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image_url: post.cover_image_url,
    published_at: post.published_at,
  }))
}

export function getPost(slug: string) {
  return getAllPosts().find((post) => post.slug === slug) ?? null
}

export function getDictionary() {
  const synced = getSyncedDictionaries()
  // Return first synced dictionary if available, otherwise fixtures
  return synced[0] ?? EXAMPLE_DICTIONARY
}

export function getWord(wordId: string) {
  const dict = getDictionary()
  return dict.words.find((word) => word.id === wordId) ?? null
}
