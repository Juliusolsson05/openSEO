import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ctaService } from '@/server/services/cta.service'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
  const elementId = Number(body.element_id ?? body.elementId)
  const ctaId = Number(body.cta_id ?? body.ctaId)

  const created = await ctaService.addCtaToPost(ctx.companyId!, blogPostId, elementId, ctaId)
  return raw(created, 201)
})

export const POST = handler
