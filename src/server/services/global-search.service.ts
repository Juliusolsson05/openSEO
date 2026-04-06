import { prisma } from '@/lib/prisma'

export type GlobalSearchItem = {
  id: string
  type: 'post' | 'title' | 'dictionary' | 'product'
  title: string
  subtitle?: string
  url: string
  updatedAt: string
}

export class GlobalSearchService {
  async search(companyId: number, query: string, limit = 8): Promise<GlobalSearchItem[]> {
    const q = query.trim()
    if (!q) return []

    const take = Math.max(1, Math.min(20, limit))

    const [posts, titles, dictionaries, products] = await Promise.all([
      prisma.blogPost.findMany({
        where: {
          companyId,
          OR: [
            { title_text: { contains: q, mode: 'insensitive' } },
            { focus_keyword: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
          ],
        },
        take,
        orderBy: { last_updated: 'desc' },
        select: { id: true, title_text: true, focus_keyword: true, last_updated: true },
      }),
      prisma.title.findMany({
        where: {
          companyId,
          OR: [
            { title_text: { contains: q, mode: 'insensitive' } },
            { focus_keyword: { contains: q, mode: 'insensitive' } },
            { seo_title: { contains: q, mode: 'insensitive' } },
          ],
        },
        take,
        orderBy: { created_at: 'desc' },
        select: { id: true, title_text: true, focus_keyword: true, created_at: true },
      }),
      prisma.dictionary.findMany({
        where: {
          companyId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { subject: { contains: q, mode: 'insensitive' } },
          ],
        },
        take,
        orderBy: { updated_at: 'desc' },
        select: { id: true, title: true, subject: true, updated_at: true },
      }),
      prisma.product.findMany({
        where: {
          companyId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { vendor: { contains: q, mode: 'insensitive' } },
          ],
        },
        take,
        orderBy: { updated_at: 'desc' },
        select: { id: true, title: true, vendor: true, updated_at: true },
      }),
    ])

    const results: GlobalSearchItem[] = [
      ...posts.map((post) => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        title: post.title_text,
        subtitle: post.focus_keyword || undefined,
        url: `/blog/${post.id}`,
        updatedAt: post.last_updated.toISOString(),
      })),
      ...titles.map((title) => ({
        id: `title-${title.id}`,
        type: 'title' as const,
        title: title.title_text,
        subtitle: title.focus_keyword || undefined,
        url: `/blog/titles`,
        updatedAt: title.created_at.toISOString(),
      })),
      ...dictionaries.map((dictionary) => ({
        id: `dictionary-${dictionary.id}`,
        type: 'dictionary' as const,
        title: dictionary.title,
        subtitle: dictionary.subject,
        url: `/dictionary/${dictionary.id}`,
        updatedAt: dictionary.updated_at.toISOString(),
      })),
      ...products.map((product) => ({
        id: `product-${product.id}`,
        type: 'product' as const,
        title: product.title,
        subtitle: product.vendor || undefined,
        url: `/publishing`,
        updatedAt: product.updated_at.toISOString(),
      })),
    ]

    return results
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, take)
  }
}

export const globalSearchService = new GlobalSearchService()
