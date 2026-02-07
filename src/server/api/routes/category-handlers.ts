import type { NextRequest } from 'next/server'

import { NotFoundError } from '@/server/api/errors'
import type { HandlerContext } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { categoryService } from '@/server/services/category.service'
import { updateCategorySchema } from '@/server/validators/category.validators'

type Handler = (ctx: HandlerContext, req: NextRequest) => Promise<ReturnType<typeof raw>>

export const handleCategoriesRoute: Handler = async (ctx, req) => {
  if (req.method === 'POST') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const categories = Array.isArray(body.categories)
      ? body.categories
      : Array.isArray(body.names)
        ? body.names
        : typeof body.name === 'string'
          ? [body.name]
          : []

    if (!Array.isArray(categories) || !categories.every((cat) => typeof cat === 'string')) {
      return raw({ detail: 'Invalid input. Please provide a category name.' }, 400)
    }

    const result = await categoryService.addCategoriesByName(ctx.companyId!, categories)
    return raw({ added_categories: result.added, existing_categories: result.existing })
  }

  const categories = await categoryService.listCategories(ctx.companyId!)
  if (!categories.length) return raw({ detail: 'No categories found for this company.' }, 404)
  return raw(
    categories.map((cat) => {
      const counts = (cat as any)._count ?? {}
      const blogPosts = counts.blog_posts ?? 0
      const titles = counts.titles ?? 0
      return {
        id: cat.id,
        name: cat.name,
        post_count: blogPosts + titles,
        blog_post_count: blogPosts,
        title_count: titles,
      }
    }),
  )
}

export const handleCategoryByIdRoute: Handler = async (ctx, req) => {
  const categoryId = Number(ctx.params.id)

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return raw({ detail: 'Category name is required.' }, 400)

    try {
      const updated = await categoryService.updateCategory(categoryId, ctx.companyId!, name)
      return raw({ id: updated.id, name: updated.name })
    } catch (err) {
      if (err instanceof NotFoundError) return raw({ detail: 'Category not found.' }, 404)
      throw err
    }
  }

  if (req.method === 'DELETE') {
    try {
      await categoryService.deleteSingleCategory(categoryId, ctx.companyId!)
      return raw({ detail: 'Category deleted successfully.' })
    } catch (err) {
      if (err instanceof NotFoundError) return raw({ detail: 'Category not found.' }, 404)
      throw err
    }
  }

  return raw({ detail: `Method "${req.method}" not allowed.` }, 405)
}

export const handleBulkDeleteCategoriesRoute: Handler = async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const categoryIds = body.category_ids ?? body.ids

  if (!Array.isArray(categoryIds) || !categoryIds.every((id) => Number.isInteger(id))) {
    return raw({ detail: 'Invalid input. Please provide a list of category IDs.' }, 400)
  }

  const ids = categoryIds as number[]
  const impactedTitles = await categoryService.getImpactedTitleIdsForCategoryIds(ctx.companyId!, ids)

  await categoryService.bulkDeleteCategories(ids, ctx.companyId!)

  let reCategorized: unknown[] = []
  if (impactedTitles.length) {
    try {
      reCategorized = await categoryService.categorizeTitles(ctx.companyId!)
    } catch (err) {
      if (!(err instanceof NotFoundError)) throw err
    }
  }

  return raw({ message: 'Categories deleted successfully.', re_categorized_titles: reCategorized })
}

export const handleGenerateCategoriesRoute: Handler = async (ctx) => {
  const data = await categoryService.generateCategories(ctx.companyId!)
  return raw(data)
}

export const handleCategorizeCategoriesRoute: Handler = async (ctx) => {
  const data = await categoryService.categorizeTitles(ctx.companyId!)
  return raw(data)
}

export const handleTitlesCategoriesAddRoute: Handler = async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const categories = Array.isArray(body.categories)
    ? body.categories
    : Array.isArray(body.names)
      ? body.names
      : typeof body.name === 'string'
        ? [body.name]
        : []

  if (!Array.isArray(categories) || !categories.every((cat) => typeof cat === 'string')) {
    return raw({ detail: 'Invalid input. Please provide a list of category names.' }, 400)
  }

  const result = await categoryService.addCategoriesByName(ctx.companyId!, categories)

  if (!result.added.length) {
    return raw({ detail: 'No new categories were added; they already exist.', existing_categories: result.existing }, 400)
  }

  return raw({ added_categories: result.added, existing_categories: result.existing })
}

export const handleTitlesCategoriesEditRoute: Handler = async (ctx) => {
  const categoryId = Number(ctx.params.id)
  const payload = validate(updateCategorySchema, ctx.body ?? {})
  const updated = await categoryService.editCategory(categoryId, ctx.companyId!, payload)

  let reCategorized: unknown[] = []
  try {
    reCategorized = await categoryService.categorizeTitles(ctx.companyId!)
  } catch (err) {
    if (!(err instanceof NotFoundError)) throw err
  }

  return raw({
    message: 'Category updated successfully.',
    category: { id: updated.id, name: updated.name },
    re_categorized_titles: reCategorized,
  })
}

export const handleTitlesCategoriesDeleteRoute: Handler = async (ctx) => {
  const categoryId = Number(ctx.params.id)
  const impactedTitles = await categoryService.getImpactedTitleIdsForCategoryIds(ctx.companyId!, [categoryId])

  await categoryService.deleteCategory(categoryId, ctx.companyId!)

  let reCategorized: unknown[] = []
  if (impactedTitles.length) {
    try {
      reCategorized = await categoryService.categorizeTitles(ctx.companyId!)
    } catch (err) {
      if (!(err instanceof NotFoundError)) throw err
    }
  }

  return raw({ message: 'Category deleted successfully.', re_categorized_titles: reCategorized })
}
