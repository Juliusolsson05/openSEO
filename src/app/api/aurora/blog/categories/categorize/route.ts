import { apiHandler } from '@/server/api/handler'
import { handleCategorizeCategoriesRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleCategorizeCategoriesRoute)

export const POST = handler
