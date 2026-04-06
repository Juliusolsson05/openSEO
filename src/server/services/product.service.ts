import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/server/api/errors'
import { generateMotivations } from '@/server/ai/products/generate-motivations'
import { populateRecommendations } from '@/server/ai/products/populate-recommendations'
import * as productRepository from '@/server/repositories/product.repository'
import type { ListProductsQueryInput, ShopifyImportInput } from '@/server/validators/product.validators'

export class ProductService {
  async listProducts(companyId: number, query: ListProductsQueryInput) {
    return productRepository.findMany(companyId, {
      search: query.search,
      ageDays: query.age,
      page: query.page,
      pageSize: query.pageSize,
    })
  }

  async importProducts(companyId: number, products: ShopifyImportInput['products']) {
    const results: unknown[] = []

    for (const product of products) {
      const variants = Array.isArray(product.variants) ? product.variants : []
      const images = Array.isArray(product.images) ? product.images : []
      const tags = Array.isArray(product.tags) ? product.tags : []

      const payload = {
        title: product.title ?? 'Untitled',
        description: product.description ?? '',
        vendor: product.vendor ?? '',
        product_type: product.product_type ?? '',
        variants,
        images,
        tagNames: tags,
      }

      if (product.id !== undefined && product.id !== null && product.id !== '') {
        // Upsert by (companyId, externalId). Two companies importing the same
        // Shopify id must each get their own Product row.
        const upserted = await productRepository.upsertByExternal({
          companyId,
          externalId: String(product.id),
          data: payload,
        })
        results.push(upserted)
      } else {
        // No external id — plain create. The internal autoincrement PK handles
        // uniqueness on its own.
        const created = await prisma.product.create({
          data: {
            companyId,
            title: payload.title,
            description: payload.description,
            vendor: payload.vendor,
            product_type: payload.product_type,
            variants: { create: variants.map((v) => ({ ...v, companyId })) },
            images: { create: images },
            tags: { create: tags.map((tag: string) => ({ name: tag })) },
          },
        })
        results.push(created)
      }
    }

    return results
  }

  async searchProducts(companyId: number, query: string, recencyDays?: number, amount?: number) {
    return productRepository.search(companyId, query, recencyDays, amount)
  }

  async populateRecommendations(companyId: number, postId?: number) {
    const post = postId
      ? await prisma.blogPost.findFirst({ where: { id: postId, companyId }, include: { elements: true } })
      : await prisma.blogPost.findFirst({ where: { companyId, elements: { some: { element_type: 'PRODUCT_RECOMMENDATIONS' } } }, include: { elements: true } })

    if (!post) throw new NotFoundError('Blog Post not found')

    const element = post.elements.find((e) => e.element_type === 'PRODUCT_RECOMMENDATIONS')
    if (!element) throw new NotFoundError('No product recommendations found for this blog post')

    const content = (element.content as any) || {}
    const query = String(content.niche ?? '')
    // `age` stays as audience descriptor (e.g. "Kids") — do not convert to a number.
    // `recency_days` is the optional freshness filter passed to the repository.
    const recencyDays = Number.isFinite(Number(content.recency_days))
      ? Number(content.recency_days)
      : undefined
    const amount = Number(content.count ?? 0) || 3

    const resultProducts = await productRepository.search(companyId, query, recencyDays, amount)
    const restProducts = await productRepository.search(companyId, query, recencyDays, Math.max(30, amount * 3))

    let recommendedProducts: any = []

    if (resultProducts.length > amount) {
      recommendedProducts = await populateRecommendations(
        post.title_text,
        resultProducts.map((p, idx) => ({ title: p.title, index: idx })) as any,
        content.title ?? '',
        content.introduction ?? '',
        amount,
        true,
      )
    } else if (resultProducts.length === amount) {
      recommendedProducts = await generateMotivations(
        post.title_text,
        resultProducts.map((p, idx) => ({ title: p.title, index: idx })) as any,
        content.title ?? '',
        content.introduction ?? '',
      )
    } else {
      const additional = await populateRecommendations(
        post.title_text,
        restProducts.map((p, idx) => ({ title: p.title, index: idx })) as any,
        content.title ?? '',
        content.introduction ?? '',
        amount - resultProducts.length,
        false,
      )

      const merged = [
        ...resultProducts.map((p) => p.title),
        ...((additional as string[]) ?? []),
      ].map((title, index) => ({ title, index }))

      recommendedProducts = await generateMotivations(
        post.title_text,
        merged as any,
        content.title ?? '',
        content.introduction ?? '',
      )
    }

    const updatedContent = { ...content, products: recommendedProducts }
    await prisma.blogPostElement.update({ where: { id: element.id }, data: { content: updatedContent as any } })

    const totalElements = await prisma.blogPostElement.count({
      where: {
        blogPostId: post.id,
        element_type: 'PRODUCT_RECOMMENDATIONS',
      },
    })

    return {
      results: recommendedProducts,
      status_code: 200,
      total_elements: totalElements,
      mapped_elements: 1,
      remaining_elements: Math.max(0, totalElements - 1),
    }
  }
}

export const productService = new ProductService()
