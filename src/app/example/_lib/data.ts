import { EXAMPLE_DICTIONARY, EXAMPLE_POSTS } from './fixtures'

export function getPosts() {
  return EXAMPLE_POSTS.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image_url: post.cover_image_url,
    published_at: post.published_at,
  }))
}

export function getPost(slug: string) {
  return EXAMPLE_POSTS.find((post) => post.slug === slug) ?? null
}

export function getDictionary() {
  return EXAMPLE_DICTIONARY
}

export function getWord(wordId: string) {
  return EXAMPLE_DICTIONARY.words.find((word) => word.id === wordId) ?? null
}
