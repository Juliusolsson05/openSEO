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
    const upserts = products.map((product) => ({
      where: { id: product.id },
      update: {
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        product_type: product.product_type,
        companyId,
        variants: {
          deleteMany: {},
          create: product.variants,
        },
        images: {
          deleteMany: {},
          create: product.images,
        },
        tags: {
          deleteMany: {},
          create: product.tags.map((tag) => ({ name: tag })),
        },
      },
      create: {
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        product_type: product.product_type,
        companyId,
        variants: { create: product.variants },
        images: { create: product.images },
        tags: { create: product.tags.map((tag) => ({ name: tag })) },
      },
    }))

    return productRepository.bulkCreate(upserts)
  }

  async searchProducts(companyId: number, query: string, age?: number, amount?: number) {
    return productRepository.search(companyId, query, age, amount)
  }

  async populateRecommendations(_companyId: number, _postId: number) {
    throw new Error('TODO: implement populateRecommendations')
  }
}

export const productService = new ProductService()
