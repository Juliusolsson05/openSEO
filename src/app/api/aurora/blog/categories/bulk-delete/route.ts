import { apiHandler } from '@/server/api/handler'
import { handleBulkDeleteCategoriesRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleBulkDeleteCategoriesRoute)

export const POST = handler
