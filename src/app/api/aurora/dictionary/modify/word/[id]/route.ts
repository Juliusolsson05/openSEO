import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx, req) => {
  const wordId = Number(ctx.params.id)
  if (req.method === 'DELETE') {
    await dictionaryService.deleteWord(wordId, ctx.companyId!)
    return raw(null, 204)
  }

  const body = (ctx.body ?? {}) as Record<string, unknown>
  const updated = await dictionaryService.modifyWord(wordId, ctx.companyId!, {
    ...(body.keyword !== undefined ? { keyword: String(body.keyword), letter: String(body.keyword)[0]?.toLowerCase() } : {}),
    ...(body.description !== undefined ? { description: String(body.description) } : {}),
    ...(body.priority !== undefined ? { priority: Number(body.priority) === 1 ? 'HIGH' : 'LOW' } : {}),
  })

  return raw({
    id: updated.id,
    keyword: updated.keyword,
    description: updated.description,
    priority: updated.priority === 'HIGH' ? 1 : 2,
    letter: updated.letter,
    has_definition: Boolean(updated.definition),
  })
})

export const PUT = handler
export const DELETE = handler
