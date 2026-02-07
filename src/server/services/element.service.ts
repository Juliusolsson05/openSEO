import type { BlogPostElementType, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import * as elementRepository from '@/server/repositories/element.repository'

type ElementPayload = {
  elementType: BlogPostElementType
  content: Prisma.InputJsonValue
  order?: number
}

type ElementUpdatePayload = {
  elementType?: BlogPostElementType
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

  async regenerateElement(_companyId: number, _elementId: number) { throw new Error('TODO: implement regenerateElement') }
  async enhanceElement(_companyId: number, _elementId: number) { throw new Error('TODO: implement enhanceElement') }
  async humanizeElement(_companyId: number, _elementId: number) { throw new Error('TODO: implement humanizeElement') }
  async listTemplates() { throw new Error('TODO: implement listTemplates') }
}

export const elementService = new ElementService()
