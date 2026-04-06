import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { BLOCK_SCHEMAS } from '@/server/ai/constants/block-schemas'
import { generateCaseStudy } from '@/server/ai/blog-elements/generate-case-study'
import { generateNewElement } from '@/server/ai/blog-elements/generate-new-element'
import { regenerateElement } from '@/server/ai/blog-elements/regenerate-element'
import { enhanceReadability } from '@/server/ai/blog-elements/enhance-readability'
import { improveLanguage } from '@/server/ai/language/improve-language'
import * as elementRepository from '@/server/repositories/element.repository'
import { toAiElementType, toDbElementType } from '@/server/utils/element-type'

type ElementPayload = {
  elementType: string
  content: Prisma.InputJsonValue
  order?: number
}

type ElementUpdatePayload = {
  elementType?: string
  content?: Prisma.InputJsonValue
  order?: number
}

export class ElementService {
  async listElements(blogPostId: number, companyId: number) {
    const post = await prisma.blogPost.findFirst({ where: { id: blogPostId, companyId } })
    if (!post) throw new NotFoundError('Blog post not found')

    return elementRepository.findByBlogPostId(blogPostId)
  }

  async addElement(blogPostId: number, companyId: number, data: ElementPayload) {
    const post = await prisma.blogPost.findFirst({ where: { id: blogPostId, companyId } })
    if (!post) throw new NotFoundError('Blog post not found')

    return elementRepository.create({
      blogPostId,
      elementType: data.elementType,
      content: data.content,
      order: data.order,
    })
  }

  async updateElement(id: number, companyId: number, data: ElementUpdatePayload) {
    const existing = await elementRepository.findById(id)
    if (!existing || existing.blog_post.companyId !== companyId) {
      throw new NotFoundError('Element not found')
    }

    const updated = await elementRepository.update(id, {
      elementType: data.elementType,
      content: data.content,
      order: data.order,
    })

    if (!updated) throw new NotFoundError('Element not found')
    return updated
  }

  async deleteElement(id: number, companyId: number) {
    const existing = await elementRepository.findById(id)
    if (!existing || existing.blog_post.companyId !== companyId) {
      throw new NotFoundError('Element not found')
    }

    return elementRepository.remove(id)
  }

  async reorderElements(blogPostId: number, companyId: number, elementIds: number[]) {
    const post = await prisma.blogPost.findFirst({ where: { id: blogPostId, companyId } })
    if (!post) throw new NotFoundError('Blog post not found')

    const elements = await elementRepository.findByBlogPostId(blogPostId)
    if (elements.length !== elementIds.length) {
      throw new ValidationError('Element list does not match blog post elements')
    }

    const validIds = new Set(elements.map((element) => element.id))
    if (elementIds.some((id) => !validIds.has(id))) {
      throw new ValidationError('Invalid element IDs provided for reorder')
    }

    return elementRepository.reorder(blogPostId, elementIds)
  }

  async addGeneratedElement(companyId: number, payload: {
    blogPostId: number
    elementId: number
    elementType: string
    generationNote: string
  }) {
    if (!(payload.elementType in BLOCK_SCHEMAS)) {
      throw new ValidationError(`Invalid element type. Must be one of: ${Object.keys(BLOCK_SCHEMAS).join(', ')}`)
    }

    const dbElementType = toDbElementType(payload.elementType)
    if (!dbElementType) throw new ValidationError(`Element type '${payload.elementType}' is not supported in database enum`)

    const blogPost = await prisma.blogPost.findFirst({
      where: { id: payload.blogPostId, companyId },
      include: { elements: { orderBy: { order: 'asc' } } },
    })
    if (!blogPost) throw new NotFoundError('Blog post not found')

    const element = blogPost.elements.find((e) => e.id === payload.elementId)
    if (!element) throw new NotFoundError('Blog post element not found')

    const elementsAbove = blogPost.elements.filter((e) => e.order <= element.order).map((e) => ({
      type: toAiElementType(e.element_type),
      content: e.content,
    }))
    const elementsBelow = blogPost.elements.filter((e) => e.order > element.order).map((e) => ({
      type: toAiElementType(e.element_type),
      content: e.content,
    }))

    const generatedContent = payload.elementType === 'case_study'
      ? await (() => {
          if (!blogPost.focus_keyword) {
            throw new ValidationError('focus_keyword is required for case_study elements.')
          }
          return generateCaseStudy(blogPost.title_text, blogPost.focus_keyword, companyId)
        })()
      : await generateNewElement(
          payload.elementType,
          blogPost.title_text,
          blogPost.excerpt ?? '',
          payload.generationNote,
          elementsAbove,
          elementsBelow,
          companyId,
        )

    return prisma.$transaction(async (tx) => {
      await tx.blogPostElement.updateMany({
        where: { blogPostId: blogPost.id, order: { gt: element.order } },
        data: { order: { increment: 1 } },
      })

      return tx.blogPostElement.create({
        data: {
          blogPostId: blogPost.id,
          element_type: dbElementType,
          order: element.order + 1,
          content: generatedContent as Prisma.InputJsonValue,
        },
      })
    })
  }

  async regenerateElementByContext(companyId: number, payload: {
    blogPostId: number
    blogElementId: number
    regenerationNote: string
    newElementType?: string | null
    newElementCount?: number
  }) {
    const blogPost = await prisma.blogPost.findFirst({
      where: { id: payload.blogPostId, companyId },
      include: { elements: { orderBy: { order: 'asc' } } },
    })
    if (!blogPost) throw new NotFoundError('Blog post not found')

    const blogElement = blogPost.elements.find((e) => e.id === payload.blogElementId)
    if (!blogElement) throw new NotFoundError('Blog post element not found')

    if (payload.newElementType && !(payload.newElementType in BLOCK_SCHEMAS)) {
      throw new ValidationError(`Invalid element type: ${payload.newElementType}`)
    }

    const targetType = payload.newElementType ?? toAiElementType(blogElement.element_type)
    const targetDbType = toDbElementType(targetType)
    if (!targetDbType) throw new ValidationError(`Element type '${targetType}' is not supported in database enum`)

    const count = Math.max(1, payload.newElementCount ?? 1)
    const above = blogPost.elements.filter((e) => e.order < blogElement.order).at(-1)
    const below = blogPost.elements.find((e) => e.order > blogElement.order)

    const regenerated = await regenerateElement(
      toAiElementType(blogElement.element_type),
      blogElement.content,
      blogPost.title_text,
      blogPost.excerpt ?? '',
      payload.regenerationNote,
      above?.content,
      below?.content,
      payload.newElementType ?? null,
      count,
      companyId,
    )

    if (count === 1) {
      const updated = await prisma.blogPostElement.update({
        where: { id: blogElement.id },
        data: {
          content: regenerated as Prisma.InputJsonValue,
          element_type: targetDbType,
        },
      })
      return [updated]
    }

    if (!Array.isArray(regenerated)) throw new ValidationError('Expected multiple regenerated elements')

    return prisma.$transaction(async (tx) => {
      const orderGap = count - 1
      await tx.blogPostElement.updateMany({
        where: { blogPostId: blogPost.id, order: { gt: blogElement.order } },
        data: { order: { increment: orderGap } },
      })

      const created = [] as Awaited<ReturnType<typeof tx.blogPostElement.create>>[]
      for (let i = 0; i < regenerated.length; i += 1) {
        const item = await tx.blogPostElement.create({
          data: {
            blogPostId: blogPost.id,
            element_type: targetDbType,
            content: regenerated[i] as Prisma.InputJsonValue,
            order: blogElement.order + i,
          },
        })
        created.push(item)
      }

      await tx.blogPostElement.delete({ where: { id: blogElement.id } })
      return created
    })
  }

  async enhanceElementByContext(companyId: number, blogPostId: number, blogElementId: number) {
    const blogPost = await prisma.blogPost.findFirst({ where: { id: blogPostId, companyId } })
    if (!blogPost) throw new NotFoundError('Blog post not found')
    const blogElement = await prisma.blogPostElement.findFirst({ where: { id: blogElementId, blogPostId } })
    if (!blogElement) throw new NotFoundError('Blog post element not found')

    const enhanced = await enhanceReadability(toAiElementType(blogElement.element_type), blogElement.content, blogPost.title_text)
    return prisma.blogPostElement.update({ where: { id: blogElement.id }, data: { content: enhanced as Prisma.InputJsonValue } })
  }

  async humanizeElementByContext(companyId: number, blogPostId: number, blogElementId: number) {
    const blogPost = await prisma.blogPost.findFirst({ where: { id: blogPostId, companyId } })
    if (!blogPost) throw new NotFoundError('Blog post not found')
    const blogElement = await prisma.blogPostElement.findFirst({ where: { id: blogElementId, blogPostId } })
    if (!blogElement) throw new NotFoundError('Blog post element not found')

    const improved = await improveLanguage(
      toAiElementType(blogElement.element_type),
      blogPost.title_text,
      (blogElement.content ?? {}) as Record<string, unknown>,
    )

    const normalized = (improved as any)?.block?.content ?? improved
    return prisma.blogPostElement.update({ where: { id: blogElement.id }, data: { content: normalized as Prisma.InputJsonValue } })
  }

  async deleteElementFromPost(companyId: number, blogPostId: number, elementId: number) {
    const blogPost = await prisma.blogPost.findFirst({ where: { id: blogPostId, companyId } })
    if (!blogPost) throw new NotFoundError('Not found.')

    const element = await prisma.blogPostElement.findFirst({ where: { id: elementId, blogPostId: blogPost.id } })
    if (!element) throw new NotFoundError('Not found.')

    await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.delete({ where: { id: element.id } })
      await tx.blogPostElement.updateMany({
        where: { blogPostId: blogPost.id, order: { gt: element.order } },
        data: { order: { decrement: 1 } },
      })
      await tx.blogPostElement.findMany({
        where: { blogPostId: blogPost.id },
        orderBy: { order: 'asc' },
        select: { id: true, element_type: true, order: true, content: true },
      })
    })
  }

  async createTemplate(name: string, elementType: string, structure: unknown) {
    const slugValue = String(name).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    return prisma.blogElementTemplate.create({
      data: {
        name: String(name),
        slug: `${slugValue}-${Date.now()}`,
        element_type: String(elementType) as any,
        structure: structure as any,
      },
    })
  }

  async applyTemplate(elementId: number, templateId: number) {
    const element = await prisma.blogPostElement.findUnique({ where: { id: elementId } })
    if (!element) throw new NotFoundError('Blog post element not found.')

    const template = await prisma.blogElementTemplate.findUnique({ where: { id: templateId } })
    if (!template) throw new NotFoundError('Element template not found.')

    const current = (element.content as Record<string, unknown>) ?? {}
    const patch = (template.structure as Record<string, unknown>) ?? {}
    const next = { ...current }
    for (const [k, v] of Object.entries(patch)) {
      if (k in next) (next as any)[k] = v
    }

    await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.update({ where: { id: element.id }, data: { content: next as any } })
      await tx.elementHyperlink.deleteMany({ where: { blogPostElementId: element.id } })
    })

    return {
      element,
      next,
    }
  }

  async addCtaElement(companyId: number, blogPostId: number, elementId: number, ctaId: number) {
    const blogPost = await prisma.blogPost.findFirst({ where: { id: blogPostId, companyId } })
    if (!blogPost) throw new NotFoundError('Not found.')

    const targetElement = await prisma.blogPostElement.findFirst({ where: { id: elementId, blogPostId: blogPost.id } })
    if (!targetElement) throw new NotFoundError('Not found.')

    const cta = await prisma.cTA.findFirst({
      where: { id: ctaId, campaign: { companyId } },
      select: { id: true, title: true, image: true, link: true, description: true },
    })
    if (!cta) throw new NotFoundError('Not found.')

    const created = await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.updateMany({
        where: { blogPostId: blogPost.id, order: { gt: targetElement.order } },
        data: { order: { increment: 1 } },
      })

      return tx.blogPostElement.create({
        data: {
          blogPostId: blogPost.id,
          element_type: 'CTA' as any,
          order: targetElement.order + 1,
          content: {
            image_url: cta.image,
            target_url: cta.link,
            title: cta.title,
          },
        },
      })
    })

    return { created, cta }
  }

  async listTemplates() {
    // Templates are the distinct element_type values currently used across all posts.
    // This gives the frontend a palette of known element types for composing new posts.
    const raw = await prisma.blogPostElement.findMany({
      distinct: ['element_type'],
      select: { element_type: true },
      orderBy: { element_type: 'asc' },
    })

    // Merge with the canonical set so the UI always shows the standard types
    const canonical = [
      'INTRODUCTION',
      'PARAGRAPH',
      'CONCLUSION',
      'FAQ',
      'LIST',
      'CTA',
      'QUOTE',
      'TABLE',
      'IMAGE',
    ]

    const existing = new Set(raw.map((r) => r.element_type))
    const merged = [...canonical]
    for (const r of raw) {
      if (!canonical.includes(r.element_type)) merged.push(r.element_type)
    }

    return merged.map((type) => ({
      element_type: type,
      in_use: existing.has(type),
    }))
  }
}

export const elementService = new ElementService()
