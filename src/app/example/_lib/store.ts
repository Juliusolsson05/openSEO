/**
 * Database store for synced content (SQLite via Prisma).
 *
 * Synced posts and dictionaries are persisted to a separate SQLite database.
 * The example site reads from both this store and the static fixtures —
 * synced data takes priority (by slug/id).
 *
 * Customers would replace this with their own PostgreSQL/MySQL database.
 * The Prisma schema is at prisma/example/schema.prisma.
 */
import { exampleDb } from './prisma'
import type { ExampleDictionary, ExamplePost, ExampleWord } from './types'

// ─── Posts ──────────────────────────────────────────────────────────

export async function getSyncedPosts(): Promise<ExamplePost[]> {
  const posts = await exampleDb.post.findMany({
    include: { elements: { orderBy: { order: 'asc' } } },
    orderBy: { publishedAt: 'desc' },
  })

  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_image_url: p.coverImage,
    published_at: p.publishedAt,
    elements: p.elements.map((el) => ({
      id: el.id,
      order: el.order,
      element_type: el.elementType,
      content: JSON.parse(el.content) as Record<string, unknown>,
    })),
  }))
}

export async function upsertSyncedPost(post: ExamplePost, auroraId?: number): Promise<ExamplePost> {
  const existing = await exampleDb.post.findFirst({
    where: { OR: [{ slug: post.slug }, ...(auroraId ? [{ auroraId }] : [])] },
  })

  const postData = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.cover_image_url,
    publishedAt: post.published_at,
    auroraId: auroraId ?? undefined,
  }

  let savedPost

  if (existing) {
    // Delete old elements and replace
    await exampleDb.element.deleteMany({ where: { postId: existing.id } })
    savedPost = await exampleDb.post.update({
      where: { id: existing.id },
      data: {
        ...postData,
        elements: {
          create: post.elements.map((el) => ({
            auroraId: el.id,
            order: el.order,
            elementType: el.element_type,
            content: JSON.stringify(el.content),
          })),
        },
      },
    })
  } else {
    savedPost = await exampleDb.post.create({
      data: {
        ...postData,
        elements: {
          create: post.elements.map((el) => ({
            auroraId: el.id,
            order: el.order,
            elementType: el.element_type,
            content: JSON.stringify(el.content),
          })),
        },
      },
    })
  }

  return { ...post, id: savedPost.id }
}

export async function deleteSyncedPost(slug: string): Promise<boolean> {
  const post = await exampleDb.post.findUnique({ where: { slug } })
  if (!post) return false
  await exampleDb.post.delete({ where: { id: post.id } })
  return true
}

// ─── Dictionaries ───────────────────────────────────────────────────

export async function getSyncedDictionaries(): Promise<ExampleDictionary[]> {
  const dicts = await exampleDb.dictionary.findMany({
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
      definition: JSON.parse(w.definition) as ExampleWord['definition'],
    })),
  }))
}

export async function upsertSyncedDictionary(dict: ExampleDictionary, auroraId?: number): Promise<ExampleDictionary> {
  const existing = await exampleDb.dictionary.findFirst({
    where: { OR: [{ id: dict.id }, ...(auroraId ? [{ auroraId }] : [])] },
  })

  const dictData = {
    name: dict.name,
    description: dict.description,
    auroraId: auroraId ?? undefined,
  }

  if (existing) {
    await exampleDb.word.deleteMany({ where: { dictionaryId: existing.id } })
    await exampleDb.dictionary.update({
      where: { id: existing.id },
      data: {
        ...dictData,
        words: {
          create: dict.words.map((w) => ({
            auroraId: w.id,
            keyword: w.keyword,
            letter: w.keyword[0]?.toUpperCase() ?? '',
            definition: JSON.stringify(w.definition),
          })),
        },
      },
    })
    return { ...dict, id: existing.id }
  }

  const saved = await exampleDb.dictionary.create({
    data: {
      ...dictData,
      words: {
        create: dict.words.map((w) => ({
          auroraId: w.id,
          keyword: w.keyword,
          letter: w.keyword[0]?.toUpperCase() ?? '',
          definition: JSON.stringify(w.definition),
        })),
      },
    },
  })

  return { ...dict, id: saved.id }
}

export async function deleteSyncedDictionary(id: string): Promise<boolean> {
  const dict = await exampleDb.dictionary.findFirst({
    where: { OR: [{ id }, { auroraId: parseInt(id.replace('synced-', ''), 10) || -1 }] },
  })
  if (!dict) return false
  await exampleDb.dictionary.delete({ where: { id: dict.id } })
  return true
}
