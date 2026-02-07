import { apiHandler } from '@/server/api/handler'
import { handleTitlesCategoriesDeleteRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleTitlesCategoriesDeleteRoute)

export const DELETE = handler
