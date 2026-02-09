import { readInboundKey, type InboundEnvelope, type InboundPostPayload } from '@/types/publishing'
import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { raw, success } from '@/server/api/response'
import { resolveCompanyByInboundApiKey } from '@/server/publishing/auth'


export const POST = apiHandler(async ({ body }, req) => {
  const inboundKey = readInboundKey(req.headers)
  if (!inboundKey) return raw({ detail: 'Missing inbound API key' }, 401)

  const companyId = await resolveCompanyByInboundApiKey(inboundKey)
  if (!companyId) return raw({ detail: 'Invalid inbound API key' }, 401)

  const envelope = (body ?? {}) as InboundEnvelope<InboundPostPayload>
  if (!envelope.event_id) throw new ValidationError('event_id is required')

  const existingInbound = await prisma.inboundEvent.findFirst({
    where: { companyId, event_id: envelope.event_id },
    select: { id: true, processed: true },
  })

  if (existingInbound?.processed) {
    return success({ status: 'duplicate_ignored', event_id: envelope.event_id })
  }

  const postPayload = envelope.payload?.post
  if (!postPayload) throw new ValidationError('payload.post is required')

  let post = null as Awaited<ReturnType<typeof prisma.blogPost.findFirst>>

  if (postPayload.remote_id) {
    const mapping = await prisma.blogPublish.findFirst({
      where: {
        remote_id: postPayload.remote_id,
        blog_post: { companyId },
      },
      select: { blogPostId: true },
    })

    if (mapping) {
      post = await prisma.blogPost.findFirst({ where: { id: mapping.blogPostId, companyId } })
    }
  }

  if (!post && postPayload.slug) {
    post = await prisma.blogPost.findFirst({ where: { slug: postPayload.slug, companyId } })
  }

  if (!post) {
    if (!postPayload.title_text || !postPayload.slug) {
      throw new ValidationError('For create, payload.post.title_text and payload.post.slug are required')
    }

    post = await prisma.blogPost.create({
      data: {
        companyId,
        title_text: postPayload.title_text,
        slug: postPayload.slug,
        seo_title: postPayload.seo_title,
        focus_keyword: postPayload.focus_keyword,
        excerpt: postPayload.excerpt,
        meta_description: postPayload.meta_description,
        status: postPayload.status ?? 'GENERATED',
      },
    })
  } else {
    post = await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        ...(postPayload.title_text !== undefined ? { title_text: postPayload.title_text } : {}),
        ...(postPayload.slug !== undefined ? { slug: postPayload.slug } : {}),
        ...(postPayload.seo_title !== undefined ? { seo_title: postPayload.seo_title } : {}),
        ...(postPayload.focus_keyword !== undefined ? { focus_keyword: postPayload.focus_keyword } : {}),
        ...(postPayload.excerpt !== undefined ? { excerpt: postPayload.excerpt } : {}),
        ...(postPayload.meta_description !== undefined ? { meta_description: postPayload.meta_description } : {}),
        ...(postPayload.status !== undefined ? { status: postPayload.status } : {}),
      },
    })
  }

  if (postPayload.remote_id) {
    const pub = await prisma.blogPublish.findFirst({ where: { blogPostId: post.id } })
    if (pub) {
      await prisma.blogPublish.update({ where: { id: pub.id }, data: { remote_id: postPayload.remote_id } })
    } else {
      await prisma.blogPublish.create({ data: { blogPostId: post.id, remote_id: postPayload.remote_id } })
    }
  }

  if (existingInbound) {
    await prisma.inboundEvent.update({
      where: { id: existingInbound.id },
      data: { payload: envelope as object, event_type: envelope.event ?? 'post.upsert', processed: true, processed_at: new Date() },
    })
  } else {
    await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'post.upsert',
        payload: envelope as object,
        processed: true,
        processed_at: new Date(),
      },
    })
  }

  return success({
    status: 'processed',
    post_id: post.id,
    event_id: envelope.event_id,
  })
}, { auth: false })
