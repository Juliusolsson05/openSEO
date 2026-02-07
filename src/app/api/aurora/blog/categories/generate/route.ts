import { apiHandler } from '@/server/api/handler'
import { handleGenerateCategoriesRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleGenerateCategoriesRoute)

export const POST = handler
