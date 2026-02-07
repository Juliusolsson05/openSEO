import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { sendJsonWebhook } from '@/server/services/webhook-delivery.service'

type CredentialsPayload = {
  api_endpoint?: string
  api_key?: string
}

type MetadataPayload = {
  url?: string
  business_description?: string
  industry_description?: string
}

type SettingsPayload = {
  name?: string
  website_url?: string
  language?: string
  [key: string]: unknown
}

export class PublishingService {
  async getCompany(companyId: number) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        website_url: true,
        language: true,
        api_endpoint: true,
        business_description: true,
        industry_description: true,
        created_at: true,
        updated_at: true,
      },
    })
    if (!company) throw new NotFoundError('Company not found')
    return company
  }

  async updateCompanyCredentials(companyId: number, payload: CredentialsPayload) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } })
    if (!company) throw new NotFoundError('Company not found')

    const data: Record<string, unknown> = {}
    if (payload.api_endpoint !== undefined) data.api_endpoint = payload.api_endpoint
    if (payload.api_key !== undefined) data.api_key = payload.api_key

    if (Object.keys(data).length === 0) throw new ValidationError('No credential fields provided')

    return prisma.company.update({ where: { id: companyId }, data })
  }

  async updateCompanyMetadata(companyId: number, payload: MetadataPayload) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } })
    if (!company) throw new NotFoundError('Company not found')

    const data: Record<string, unknown> = {}
    if (payload.business_description !== undefined) data.business_description = payload.business_description
    if (payload.industry_description !== undefined) data.industry_description = payload.industry_description
    if (payload.url !== undefined) data.website_url = payload.url

    if (Object.keys(data).length === 0) throw new ValidationError('No metadata fields provided')

    return prisma.company.update({ where: { id: companyId }, data })
  }

  async updateCompanySettings(companyId: number, payload: SettingsPayload) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } })
    if (!company) throw new NotFoundError('Company not found')

    const data: Record<string, unknown> = {}
    if (payload.name !== undefined) data.name = payload.name
    if (payload.website_url !== undefined) data.website_url = payload.website_url
    if (payload.language !== undefined) data.language = payload.language

    if (Object.keys(data).length === 0) throw new ValidationError('No settings fields provided')

    return prisma.company.update({ where: { id: companyId }, data })
  }

  async publishPost(companyId: number, postId: number) {
    const post = await prisma.blogPost.findFirst({
      where: { id: postId, companyId },
      include: {
        categories: { select: { name: true } },
        elements: { orderBy: { order: 'asc' } },
      },
    })
    if (!post) throw new NotFoundError('Blog post not found')

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { api_endpoint: true, api_key: true },
    })

    if (!company?.api_endpoint) throw new ValidationError('Publishing endpoint is not configured')

    const envelope = {
      contract_version: '2026-02-1',
      event: 'post.publish',
      event_id: `evt_${crypto.randomUUID()}`,
      sent_at: new Date().toISOString(),
      payload: {
        post: {
          id: post.id,
          title_text: post.title_text,
          slug: post.slug,
          seo_title: post.seo_title,
          focus_keyword: post.focus_keyword,
          excerpt: post.excerpt,
          meta_description: post.meta_description,
          status: 'PUBLISHED',
          categories: post.categories.map((c) => c.name),
        },
        processed_content: {
          id: post.id,
          elements: post.elements.map((el) => ({
            id: el.id,
            order: el.order,
            element_type: el.element_type.toLowerCase(),
            content: el.content,
          })),
        },
      },
    }

    const delivery = await sendJsonWebhook({
      endpoint: company.api_endpoint,
      apiKey: company.api_key,
      eventType: 'post.publish',
      payload: envelope,
    })

    if (!delivery.ok) {
      throw new ValidationError(`Publish delivery failed: HTTP ${delivery.status}`)
    }

    await prisma.blogPost.update({
      where: { id: postId },
      data: { status: 'PUBLISHED' },
    })

    const existing = await prisma.blogPublish.findFirst({ where: { blogPostId: postId } })
    if (existing) {
      await prisma.blogPublish.update({ where: { id: existing.id }, data: { remote_id: delivery.deliveryId } })
    } else {
      await prisma.blogPublish.create({ data: { blogPostId: postId, remote_id: delivery.deliveryId } })
    }

    return { post_id: postId, remote_id: delivery.deliveryId, status: 'published' }
  }

  async unpublishPost(companyId: number, postId: number) {
    const post = await prisma.blogPost.findFirst({ where: { id: postId, companyId }, select: { id: true } })
    if (!post) throw new NotFoundError('Blog post not found')

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { api_endpoint: true, api_key: true },
    })

    if (company?.api_endpoint) {
      const envelope = {
        contract_version: '2026-02-1',
        event: 'post.unpublish',
        event_id: `evt_${crypto.randomUUID()}`,
        sent_at: new Date().toISOString(),
        payload: { post: { id: postId } },
      }

      await sendJsonWebhook({
        endpoint: company.api_endpoint,
        apiKey: company.api_key,
        eventType: 'post.unpublish',
        payload: envelope,
      })
    }

    await prisma.blogPost.update({
      where: { id: postId },
      data: { status: 'GENERATED' },
    })

    return { post_id: postId, status: 'unpublished' }
  }
}

export const publishingService = new PublishingService()
