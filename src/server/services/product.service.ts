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

      if (product.id) {
        const upserted = await productRepository.bulkCreate([{
          where: { id: product.id },
          update: {
            title: product.title,
            description: product.description ?? '',
            vendor: product.vendor ?? '',
            product_type: product.product_type ?? '',
            companyId,
            variants: { deleteMany: {}, create: variants },
            images: { deleteMany: {}, create: images },
            tags: { deleteMany: {}, create: tags.map((tag: string) => ({ name: tag })) },
          },
          create: {
            id: product.id,
            title: product.title,
            description: product.description ?? '',
            vendor: product.vendor ?? '',
            product_type: product.product_type ?? '',
            companyId,
            variants: { create: variants },
            images: { create: images },
            tags: { create: tags.map((tag: string) => ({ name: tag })) },
          },
        }])
        results.push(...(Array.isArray(upserted) ? upserted : [upserted]))
      } else {
        // No Shopify ID — just create
        const created = await prisma.product.create({
          data: {
            title: product.title ?? 'Untitled',
            description: product.description ?? '',
            vendor: product.vendor ?? '',
            product_type: product.product_type ?? '',
            companyId,
            variants: { create: variants },
            images: { create: images },
            tags: { create: tags.map((tag: string) => ({ name: tag })) },
          },
        })
        results.push(created)
      }
    }

    return results
  }

  async searchProducts(companyId: number, query: string, age?: number, amount?: number) {
    return productRepository.search(companyId, query, age, amount)
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
    const age = Number(content.age ?? 0) || undefined
    const amount = Number(content.count ?? 0) || 3

    const resultProducts = await productRepository.search(companyId, query, age, amount)
    const restProducts = await productRepository.search(companyId, query, age, Math.max(30, amount * 3))

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
