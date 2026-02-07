import { apiHandler } from '@/server/api/handler'
import { handleCategoriesRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleCategoriesRoute)

export const GET = handler
export const POST = handler
