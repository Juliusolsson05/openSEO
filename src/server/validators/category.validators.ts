import { z } from 'zod'

export const addCategoriesSchema = z.object({
  names: z.array(z.string().min(1).max(255)).min(1),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255),
})

export const bulkDeleteCategoriesSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
})

export type AddCategoriesInput = z.infer<typeof addCategoriesSchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type BulkDeleteCategoriesInput = z.infer<typeof bulkDeleteCategoriesSchema>
