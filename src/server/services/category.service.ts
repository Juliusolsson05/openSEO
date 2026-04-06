import { prisma } from '@/lib/prisma'
import { generateCategories as generateCategoriesAI } from '@/server/ai/categories/generate-categories'
import { categorizeTitles as categorizeTitlesAI } from '@/server/ai/categories/categorize-titles'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import * as categoryRepository from '@/server/repositories/category.repository'

type UpdateCategoryPayload = {
  name?: string
}

type AddCategoriesByNameResult = {
  added: string[]
  existing: string[]
}

export class CategoryService {
  async listCategories(companyId: number) {
    return categoryRepository.findMany(companyId)
  }

  async addCategories(companyId: number, names: string[]) {
    return Promise.all(
      names.map((name) =>
        categoryRepository.create(companyId, {
          name,
        }),
      ),
    )
  }

  async addCategoriesByName(companyId: number, names: string[]): Promise<AddCategoriesByNameResult> {
    const added: string[] = []
    const existing: string[] = []

    for (const name of names) {
      const normalized = name.trim()
      if (!normalized) continue

      const exists = await prisma.category.findFirst({ where: { companyId, name: normalized } })
      if (exists) {
        existing.push(normalized)
        continue
      }

      await categoryRepository.create(companyId, { name: normalized })
      added.push(normalized)
    }

    return { added, existing }
  }

  async editCategory(id: number, companyId: number, data: UpdateCategoryPayload) {
    const existing = await categoryRepository.findById(id)
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError('Category not found')
    }

    const updated = await categoryRepository.update(id, data)
    if (!updated) throw new NotFoundError('Category not found')
    return updated
  }

  async updateCategory(id: number, companyId: number, name: string) {
    const existing = await categoryRepository.findById(id)
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError('Category not found')
    }

    const updated = await categoryRepository.update(id, { name })
    if (!updated) throw new NotFoundError('Category not found')
    return updated
  }

  async deleteCategory(id: number, companyId: number) {
    const existing = await categoryRepository.findById(id)
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError('Category not found')
    }

    return categoryRepository.remove(id)
  }

  async deleteSingleCategory(id: number, companyId: number) {
    const existing = await categoryRepository.findById(id)
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError('Category not found')
    }

    await categoryRepository.remove(id)
  }

  async bulkDeleteCategories(ids: number[], companyId: number) {
    const categories = await Promise.all(ids.map((id) => categoryRepository.findById(id)))

    if (categories.some((category) => !category || category.companyId !== companyId)) {
      throw new ValidationError('One or more categories are invalid for this company')
    }

    return categoryRepository.bulkDelete(ids)
  }

  async getImpactedTitleIdsForCategoryIds(companyId: number, categoryIds: number[]) {
    return prisma.title.findMany({
      where: { companyId, categories: { some: { id: { in: categoryIds } } } },
      select: { id: true },
    })
  }

  async generateCategories(companyId: number) {
    const titles = await prisma.title.findMany({ where: { companyId }, select: { title_text: true } })
    if (!titles.length) throw new NotFoundError('No titles found for the specified company.')

    const existing = await prisma.category.findMany({ where: { companyId }, select: { name: true } })
    const prompt =
      'These are the categories that we currently have for this company. You can choose to keep the current categories or, if absolutely necessary, add one or two more. Only do this if you believe the category system will become more clear and user-friendly.\n\nCurrent categories:\n' +
      existing.map((c) => c.name).join('\n') +
      '\n\nNow, based on the following titles, generate a list of at least 6 categories:'

    const generated = await generateCategoriesAI(titles.map((t) => t.title_text), 'en', 6, prompt)

    const saved: string[] = []
    await prisma.$transaction(async (tx) => {
      for (const name of generated) {
        const result = await categoryRepository.findOrCreateByName(tx, companyId, name)
        if (result.created) saved.push(name)
      }
    })

    return { generated_categories: generated, saved_categories: saved }
  }

  async categorizeTitles(companyId: number) {
    const titles = await prisma.title.findMany({ where: { companyId }, select: { id: true, title_text: true } })
    const categories = await prisma.category.findMany({ where: { companyId }, select: { id: true, name: true } })
    if (!titles.length || !categories.length) {
      throw new NotFoundError('No titles or categories found for the specified company.')
    }

    const categorized = await categorizeTitlesAI(titles, categories)

    await prisma.$transaction(async (tx) => {
      for (const item of categorized) {
        const categoryIds = item.categories.map((cat) => cat.id)
        await tx.title.update({
          where: { id: item.id },
          data: { categories: { set: categoryIds.map((id) => ({ id })) } },
        })
      }
    })

    return categorized
  }

  async categorizeTitle(companyId: number, titleId: number) {
    const title = await prisma.title.findFirst({
      where: { id: titleId, companyId },
      select: { id: true, title_text: true },
    })
    if (!title) throw new NotFoundError('Title not found')

    const categories = await categoryRepository.findMany(companyId)
    if (categories.length === 0) throw new ValidationError('No categories exist. Create categories first.')

    const results = await categorizeTitlesAI(
      [{ id: title.id, title_text: title.title_text }],
      categories.map((c) => ({ id: c.id, name: c.name })),
    )

    const match = results.find((r) => r.id === titleId)
    const assignedIds: number[] = (match?.categories ?? []).map((c) => c.id)
    if (assignedIds.length > 0) {
      await prisma.title.update({
        where: { id: titleId },
        data: {
          categories: { set: assignedIds.map((id) => ({ id })) },
        },
      })
    }

    return {
      title_id: titleId,
      assigned_category_ids: assignedIds,
    }
  }
}

export const categoryService = new CategoryService()
