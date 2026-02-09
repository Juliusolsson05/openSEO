import { readInboundKey } from '@/types/publishing'
import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { raw, success } from '@/server/api/response'
import { resolveCompanyByInboundApiKey } from '@/server/publishing/auth'

type InboundEnvelope = {
  event?: string
  event_id?: string
  payload?: {
    post?: {
      id?: number
      remote_id?: string
      slug?: string
    }
  }
}


export const POST = apiHandler(async ({ body }, req) => {
  const inboundKey = readInboundKey(req.headers)
  if (!inboundKey) return raw({ detail: 'Missing inbound API key' }, 401)

  const companyId = await resolveCompanyByInboundApiKey(inboundKey)
  if (!companyId) return raw({ detail: 'Invalid inbound API key' }, 401)

  const envelope = (body ?? {}) as InboundEnvelope
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

  let postId: number | null = null

  if (postPayload.id) {
    const post = await prisma.blogPost.findFirst({ where: { id: postPayload.id, companyId }, select: { id: true } })
    postId = post?.id ?? null
  }

  if (!postId && postPayload.remote_id) {
    const mapping = await prisma.blogPublish.findFirst({
      where: { remote_id: postPayload.remote_id, blog_post: { companyId } },
      select: { blogPostId: true },
    })
    postId = mapping?.blogPostId ?? null
  }

  if (!postId && postPayload.slug) {
    const post = await prisma.blogPost.findFirst({ where: { slug: postPayload.slug, companyId }, select: { id: true } })
    postId = post?.id ?? null
  }

  if (!postId) throw new ValidationError('Post not found for delete')

  await prisma.blogPost.delete({ where: { id: postId } })

  if (existingInbound) {
    await prisma.inboundEvent.update({
      where: { id: existingInbound.id },
      data: {
        payload: envelope as object,
        event_type: envelope.event ?? 'post.delete',
        processed: true,
        processed_at: new Date(),
      },
    })
  } else {
    await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'post.delete',
        payload: envelope as object,
        processed: true,
        processed_at: new Date(),
      },
    })
  }

  return success({ status: 'processed', deleted_post_id: postId, event_id: envelope.event_id })
}, { auth: false })
