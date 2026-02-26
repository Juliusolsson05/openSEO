/**
 * Database store for synced content (PostgreSQL via main Prisma client).
 *
 * Uses the same database as Aurora with dedicated tables (example_posts,
 * example_elements, example_dictionaries, example_words). Content is scoped
 * by companyId so each company's published site is isolated.
 *
 * Customers would adapt this to their own database and ORM.
 */
import { prisma } from '@/lib/prisma'
import type { ExampleDictionary, ExamplePost, ExampleWord } from './types'

function parseCoverImage(value: string): { url: string; alt?: string } {
  if (!value) return { url: '' }

  try {
    const parsed = JSON.parse(value) as { url?: string; alt?: string }
    if (parsed && typeof parsed.url === 'string') {
      return { url: parsed.url, alt: typeof parsed.alt === 'string' ? parsed.alt : undefined }
    }
  } catch {
    // Keep backward compatibility when cover image is stored as plain URL.
  }

  return { url: value }
}

// ─── Posts ──────────────────────────────────────────────────────────

export async function getSyncedPosts(companyId: number): Promise<ExamplePost[]> {
  const posts = await prisma.examplePost.findMany({
    where: { companyId },
    include: { elements: { orderBy: { order: 'asc' } } },
    orderBy: { publishedAt: 'desc' },
  })

  return posts.map((p) => {
    const coverImage = parseCoverImage(p.coverImage)

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cover_image_url: coverImage.url,
      cover_image_alt: coverImage.alt,
      published_at: p.publishedAt,
      elements: p.elements.map((el) => ({
        id: el.id,
        order: el.order,
        element_type: el.elementType,
        content: el.content as Record<string, unknown>,
      })),
    }
  })
}

export async function upsertSyncedPost(
  companyId: number,
  post: ExamplePost,
  auroraId?: number,
): Promise<ExamplePost> {
  const existing = auroraId
    ? await prisma.examplePost.findUnique({ where: { companyId_auroraId: { companyId, auroraId } } })
    : await prisma.examplePost.findUnique({ where: { companyId_slug: { companyId, slug: post.slug } } })

  const postData = {
    companyId,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.cover_image_alt
      ? JSON.stringify({ url: post.cover_image_url, alt: post.cover_image_alt })
      : post.cover_image_url,
    publishedAt: post.published_at,
    auroraId: auroraId ?? null,
  }

  const elementsCreate = post.elements.map((el) => ({
    auroraId: el.id,
    order: el.order,
    elementType: el.element_type,
    content: el.content as any,
  }))

  if (existing) {
    await prisma.exampleElement.deleteMany({ where: { postId: existing.id } })
    const saved = await prisma.examplePost.update({
      where: { id: existing.id },
      data: { ...postData, elements: { create: elementsCreate } },
    })
    return { ...post, id: saved.id }
  }

  const saved = await prisma.examplePost.create({
    data: { ...postData, elements: { create: elementsCreate } },
  })
  return { ...post, id: saved.id }
}

export async function deleteSyncedPost(companyId: number, slug: string): Promise<boolean> {
  const post = await prisma.examplePost.findUnique({ where: { companyId_slug: { companyId, slug } } })
  if (!post) return false
  await prisma.examplePost.delete({ where: { id: post.id } })
  return true
}

// ─── Dictionaries ───────────────────────────────────────────────────

export async function getSyncedDictionaries(companyId: number): Promise<ExampleDictionary[]> {
  const dicts = await prisma.exampleDictionary.findMany({
    where: { companyId },
    include: { words: { orderBy: { keyword: 'asc' } } },
  })

  return dicts.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    word_count: d.words.length,
    words: d.words.map((w): ExampleWord => ({
      id: w.id,
      keyword: w.keyword,
      definition: w.definition as unknown as ExampleWord['definition'],
    })),
  }))
}

export async function upsertSyncedDictionary(
  companyId: number,
  dict: ExampleDictionary,
  auroraId?: number,
): Promise<ExampleDictionary> {
  const existing = auroraId
    ? await prisma.exampleDictionary.findUnique({ where: { companyId_auroraId: { companyId, auroraId } } })
    : null

  const dictData = {
    companyId,
    name: dict.name,
    description: dict.description,
    auroraId: auroraId ?? null,
  }

  const wordsCreate = dict.words.map((w) => ({
    auroraId: w.id,
    keyword: w.keyword,
    letter: w.keyword[0]?.toUpperCase() ?? '',
    definition: w.definition as object,
  }))

  if (existing) {
    await prisma.exampleWord.deleteMany({ where: { dictionaryId: existing.id } })
    await prisma.exampleDictionary.update({
      where: { id: existing.id },
      data: { ...dictData, words: { create: wordsCreate } },
    })
    return { ...dict, id: existing.id }
  }

  const saved = await prisma.exampleDictionary.create({
    data: { ...dictData, words: { create: wordsCreate } },
  })
  return { ...dict, id: saved.id }
}

export async function deleteSyncedDictionary(companyId: number, auroraId: number): Promise<boolean> {
  const dict = await prisma.exampleDictionary.findUnique({
    where: { companyId_auroraId: { companyId, auroraId } },
  })
  if (!dict) return false
  await prisma.exampleDictionary.delete({ where: { id: dict.id } })
  return true
}
