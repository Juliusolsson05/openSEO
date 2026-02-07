import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { titleService } from '@/server/services/title.service'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>

  const amount = Number(body.count ?? body.amount ?? 10)
  const topic = (body.topic as string | undefined) ?? undefined
  const businessType = (body.business_type ?? body.businessType ?? topic) as string | undefined

  const created = await titleService.generateTitles(ctx.companyId!, {
    businessType,
    keywords: (body.keywords as string[] | undefined) ?? undefined,
    language: (body.language as string | undefined) ?? undefined,
    amount,
  })

  return raw(created)
})

export const POST = handler
