import { apiHandler } from '@/server/api/handler'
import { handleTitlesCategoriesAddRoute } from '@/server/api/routes/category-handlers'

const handler = apiHandler(handleTitlesCategoriesAddRoute)

export const POST = handler
