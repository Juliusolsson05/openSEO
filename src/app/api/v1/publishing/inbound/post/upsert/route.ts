import { Prisma } from '@prisma/client'
import { readInboundKey, type InboundEnvelope, type InboundPostPayload } from '@/types/publishing'
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

  const envelope = (body ?? {}) as InboundEnvelope<InboundPostPayload>
  if (!envelope.event_id) throw new ValidationError('event_id is required')

  let inboundRow
  try {
    inboundRow = await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'post.upsert',
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

    let post = null as Awaited<ReturnType<typeof prisma.blogPost.findFirst>>

    // 1. Match by Aurora post ID if provided (docs section 8).
    if (typeof postPayload.id === 'number') {
      post = await prisma.blogPost.findFirst({
        where: { id: postPayload.id, companyId },
      })
    }

    // 2. Match by slug within company.
    if (!post && postPayload.slug) {
      post = await prisma.blogPost.findUnique({
        where: { companyId_slug: { companyId, slug: postPayload.slug } },
      })
    }

    // 3. Fallback: match by remote_id via publish mapping (backward compat).
    if (!post && postPayload.remote_id) {
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

    // Replace-all elements upsert (BlogPostElement has no natural unique key,
    // so we delete then insert in a single transaction).
    // ElementHyperlink cascades from BlogPostElement, so deletes are safe.
    if (Array.isArray(envelope.payload?.elements)) {
      const incoming = envelope.payload.elements
      await prisma.$transaction(async (tx) => {
        await tx.blogPostElement.deleteMany({ where: { blogPostId: post!.id } })
        if (incoming.length > 0) {
          await tx.blogPostElement.createMany({
            data: incoming.map((el, idx) => {
              const content =
                typeof el.content === 'string'
                  ? (() => { try { return JSON.parse(el.content as string) } catch { return {} } })()
                  : (el.content ?? {})
              return {
                blogPostId: post!.id,
                element_type: String(el.element_type ?? 'paragraph'),
                order: typeof el.order === 'number' ? el.order : idx,
                content: content as object,
              }
            }),
          })
        }
      })
    }

    // Categories upsert: set + connectOrCreate by name (Category.name is globally unique).
    if (Array.isArray(postPayload.categories)) {
      const names = postPayload.categories
        .map((c) => (typeof c === 'string' ? c.trim() : ''))
        .filter((c): c is string => c.length > 0)

      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          categories: {
            set: [],
            connectOrCreate: names.map((name) => ({
              where: { companyId_name: { companyId, name } },
              create: {
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                companyId,
              },
            })),
          },
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

    await prisma.inboundEvent.update({
      where: { id: inboundRow.id },
      data: { processed: true, processed_at: new Date() },
    })

    result = success({
      status: 'processed',
      post_id: post.id,
      event_id: envelope.event_id,
    })
  } catch (err) {
    if (!(err instanceof AppError)) {
      await prisma.inboundEvent.delete({ where: { id: inboundRow.id } }).catch(() => {})
    }
    throw err
  }

  return result
}, { auth: false })
