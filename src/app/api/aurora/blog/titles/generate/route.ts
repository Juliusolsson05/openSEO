import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { titleService } from '@/server/services/title.service'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const created = await titleService.generateTitles(ctx.companyId!, {
    businessType: (body.business_type ?? body.businessType) as string | undefined,
    keywords: (body.keywords as string[] | undefined) ?? undefined,
    language: (body.language as string | undefined) ?? undefined,
    amount: Number(body.amount ?? 10),
  })
  return raw(created)
})

export const POST = handler
