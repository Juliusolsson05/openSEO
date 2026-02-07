import { apiHandler } from '@/server/api/handler'
import { handleTitlesCategoriesEditRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleTitlesCategoriesEditRoute)

export const PUT = handler
export const PATCH = handler
