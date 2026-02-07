import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx) => raw(await dictionaryService.uploadDictionary(ctx.companyId!, ctx.body)))
export const POST = handler
