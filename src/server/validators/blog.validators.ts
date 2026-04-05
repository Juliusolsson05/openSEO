import { z } from 'zod'

const blogStatusSchema = z.enum(['TO_BE_GENERATED', 'APPROVED', 'REJECTED', 'GENERATED', 'PUBLISHED'])
const blogOperationSchema = z.enum(['NONE', 'POST_SYNCING', 'KEYWORD_SYNCING'])

const blogSortSchema = z.enum([
  'createdAtDesc',
  'createdAtAsc',
  'updatedAtDesc',
  'updatedAtAsc',
  'scheduledDateDesc',
  'scheduledDateAsc',
])

const categoryIdsSchema = z
  .union([
    z.array(z.coerce.number().int().positive()),
    z.coerce.number().int().positive(),
    z.string(),
  ])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined
    if (Array.isArray(value)) return value
    if (typeof value === 'number') return [value]

    return value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0)
  })

export const listBlogPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: blogStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  categoryIds: categoryIdsSchema,
  publishStatus: z.enum(['published', 'drafts', 'all']).optional(),
  sort: blogSortSchema.default('createdAtDesc'),
})

export const createBlogPostSchema = z.object({
  titleText: z.string().min(3).max(255),
  seoTitle: z.string().min(3).max(255).optional(),
  focusKeyword: z.string().min(2).max(255).optional(),
  metaDescription: z.string().max(320).optional(),
  excerpt: z.string().max(3000).optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  coverImage: z.record(z.string(), z.unknown()).optional(),
  scheduledDate: z.string().datetime().optional(),
})

export const updateBlogPostSchema = createBlogPostSchema
  .partial()
  .extend({
    reviewed: z.boolean().optional(),
    keywordSynced: z.boolean().optional(),
    keywordLinked: z.boolean().optional(),
    postsSynced: z.boolean().optional(),
    imageGeneration: z.boolean().optional(),
    status: blogStatusSchema.optional(),
    operation: blogOperationSchema.optional(),
    generatedDate: z.string().datetime().optional(),
  })

export const blogPostIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const generateBlogPostSchema = z.object({
  titleId: z.number().int().positive(),
})

export type ListBlogPostsQueryInput = z.infer<typeof listBlogPostsQuerySchema>
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>
export type BlogPostIdInput = z.infer<typeof blogPostIdSchema>
export type GenerateBlogPostInput = z.infer<typeof generateBlogPostSchema>
