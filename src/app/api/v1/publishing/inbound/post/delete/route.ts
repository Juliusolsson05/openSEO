import { Prisma } from '@prisma/client'
import { readInboundKey, type InboundEnvelope, type InboundPostDeletePayload } from '@/types/publishing'
import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { AppError, ValidationError } from '@/server/api/errors'
import { raw, success } from '@/server/api/response'
import { resolveCompanyByInboundApiKey } from '@/server/publishing/auth'


export const POST = apiHandler(async ({ body }, req) => {
  const inboundKey = readInboundKey(req.headers)
  if (!inboundKey) return raw({ detail: 'Missing inbound API key' }, 401)

  const companyId = await resolveCompanyByInboundApiKey(inboundKey)
  if (!companyId) return raw({ detail: 'Invalid inbound API key' }, 401)

  const envelope = (body ?? {}) as InboundEnvelope<InboundPostDeletePayload>
  if (!envelope.event_id) throw new ValidationError('event_id is required')

  let inboundRow
  try {
    inboundRow = await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'post.delete',
        payload: envelope as object,
        processed: false,
      },
      select: { id: true },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return success({ status: 'duplicate_ignored', event_id: envelope.event_id, idempotent: true })
    }
    throw err
  }

  let result
  try {
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
      const post = await prisma.blogPost.findUnique({
        where: { companyId_slug: { companyId, slug: postPayload.slug } },
        select: { id: true },
      })
      postId = post?.id ?? null
    }

    if (!postId) throw new ValidationError('Post not found for delete')

    await prisma.blogPost.delete({ where: { id: postId } })

    await prisma.inboundEvent.update({
      where: { id: inboundRow.id },
      data: { processed: true, processed_at: new Date() },
    })

    result = success({ status: 'processed', deleted_post_id: postId, event_id: envelope.event_id })
  } catch (err) {
    if (!(err instanceof AppError)) {
      await prisma.inboundEvent.delete({ where: { id: inboundRow.id } }).catch(() => {})
    }
    throw err
  }

  return result
}, { auth: false })
