import { apiHandler } from '@/server/api/handler'
import { handleCategoryByIdRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleCategoryByIdRoute)

export const PUT = handler
export const PATCH = handler
export const DELETE = handler
