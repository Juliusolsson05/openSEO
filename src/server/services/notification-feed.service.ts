import { prisma } from '@/lib/prisma'

export type NotificationFeedItem = {
  id: string
  title: string
  subtitle: string
  createdAt: string
  url: string
  level: 'info' | 'success' | 'warning'
}

export class NotificationFeedService {
  async list(companyId: number, limit = 20): Promise<NotificationFeedItem[]> {
    const take = Math.max(1, Math.min(50, limit))

    const [recentPosts, recentDictionaries, recentSchedules] = await Promise.all([
      prisma.blogPost.findMany({
        where: { companyId },
        orderBy: { last_updated: 'desc' },
        take,
        select: {
          id: true,
          title_text: true,
          status: true,
          last_updated: true,
          generated_date: true,
          publishes: {
            take: 1,
            orderBy: { sync_date: 'desc' },
            select: { remote_id: true, sync_date: true },
          },
        },
      }),
      prisma.dictionary.findMany({
        where: { companyId },
        orderBy: { updated_at: 'desc' },
        take,
        select: { id: true, title: true, status: true, current_letter: true, updated_at: true },
      }),
      prisma.blogPost.findMany({
        where: { companyId, scheduled_date: { not: null } },
        orderBy: { scheduled_date: 'asc' },
        take: Math.min(8, take),
        select: { id: true, title_text: true, scheduled_date: true },
      }),
    ])

    const items: NotificationFeedItem[] = []

    for (const post of recentPosts) {
      const publish = post.publishes[0]
      if (publish?.remote_id) {
        items.push({
          id: `published-${post.id}-${publish.sync_date.toISOString()}`,
          title: 'Post published',
          subtitle: post.title_text,
          createdAt: publish.sync_date.toISOString(),
          url: `/blog/${post.id}`,
          level: 'success',
        })
      } else if (post.status === 'GENERATED' && post.generated_date) {
        items.push({
          id: `generated-${post.id}-${post.generated_date.toISOString()}`,
          title: 'Post generated',
          subtitle: post.title_text,
          createdAt: post.generated_date.toISOString(),
          url: `/blog/${post.id}`,
          level: 'info',
        })
      }
    }

    for (const dictionary of recentDictionaries) {
      const done = dictionary.status === 'COMPLETED'
      items.push({
        id: `dictionary-${dictionary.id}`,
        title: done ? 'Dictionary completed' : 'Dictionary in progress',
        subtitle: done
          ? dictionary.title
          : `${dictionary.title} · letter ${(dictionary.current_letter || 'a').toUpperCase()}`,
        createdAt: dictionary.updated_at.toISOString(),
        url: `/dictionary/${dictionary.id}`,
        level: done ? 'success' : 'warning',
      })
    }

    for (const scheduled of recentSchedules) {
      if (!scheduled.scheduled_date) continue
      items.push({
        id: `scheduled-${scheduled.id}-${scheduled.scheduled_date.toISOString()}`,
        title: 'Post scheduled',
        subtitle: `${scheduled.title_text}`,
        createdAt: scheduled.scheduled_date.toISOString(),
        url: `/blog/scheduling`,
        level: 'info',
      })
    }

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, take)
  }
}

export const notificationFeedService = new NotificationFeedService()
