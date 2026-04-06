import { Prisma } from '@prisma/client'

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
        metadata: true,
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
    const existing = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, metadata: true },
    })
    if (!existing) throw new NotFoundError('Company not found')

    const hasMetadataField =
      payload.business_description !== undefined || payload.industry_description !== undefined
    const hasUrlField = payload.url !== undefined

    if (!hasMetadataField && !hasUrlField) {
      throw new ValidationError('No metadata fields provided')
    }

    const currentMetadata =
      existing.metadata && typeof existing.metadata === 'object' && !Array.isArray(existing.metadata)
        ? (existing.metadata as Record<string, unknown>)
        : {}

    const nextMetadata: Record<string, unknown> = { ...currentMetadata }
    if (payload.business_description !== undefined) {
      nextMetadata.business_description = payload.business_description
    }
    if (payload.industry_description !== undefined) {
      nextMetadata.industry_description = payload.industry_description
    }

    const data: Record<string, unknown> = {}
    if (hasMetadataField) {
      data.metadata = nextMetadata as Prisma.InputJsonValue
    }
    if (hasUrlField) {
      data.website_url = payload.url
    }

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

    const delivery = await sendJsonWebhook({
      endpoint: company.api_endpoint,
      apiKey: company.api_key,
      eventType: 'post.publish',
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

    if (!company?.api_endpoint) {
      throw new ValidationError('Publishing endpoint is not configured')
    }

    const delivery = await sendJsonWebhook({
      endpoint: company.api_endpoint,
      apiKey: company.api_key,
      eventType: 'post.unpublish',
      payload: { post: { id: postId } },
    })

    if (!delivery.ok) {
      // Do NOT flip local state — leave the post as PUBLISHED so the
      // caller can retry. Local and remote must agree before we mark
      // the post unpublished locally.
      throw new ValidationError(`Unpublish delivery failed: HTTP ${delivery.status}`)
    }

    await prisma.blogPost.update({
      where: { id: postId },
      data: { status: 'GENERATED' },
    })

    return { post_id: postId, status: 'unpublished', remote_id: delivery.deliveryId }
  }
}

export const publishingService = new PublishingService()
