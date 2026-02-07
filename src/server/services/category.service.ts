import { NotFoundError, ValidationError } from '@/server/api/errors'
import * as categoryRepository from '@/server/repositories/category.repository'

type UpdateCategoryPayload = {
  name?: string
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

  async editCategory(id: number, companyId: number, data: UpdateCategoryPayload) {
    const existing = await categoryRepository.findById(id)
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError('Category not found')
    }

    const updated = await categoryRepository.update(id, data)
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

  async bulkDeleteCategories(ids: number[], companyId: number) {
    const categories = await Promise.all(ids.map((id) => categoryRepository.findById(id)))

    if (categories.some((category) => !category || category.companyId !== companyId)) {
      throw new ValidationError('One or more categories are invalid for this company')
    }

    return categoryRepository.bulkDelete(ids)
  }

  async generateCategories(_companyId: number, _payload: unknown) { throw new Error('TODO: implement generateCategories') }
  async categorizeTitle(_companyId: number, _titleId: number) { throw new Error('TODO: implement categorizeTitle') }
}

export const categoryService = new CategoryService()
