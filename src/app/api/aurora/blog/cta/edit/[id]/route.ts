import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { updateCtaSchema } from '@/server/validators/cta.validators'

const handler = apiHandler(async (ctx) => {
  const ctaId = Number(ctx.params.id)
  let payloadInput: Record<string, unknown> = {}
  let imageFile: File | null = null

  if (ctx.body instanceof FormData) {
    const titleRaw = ctx.body.get('title')
    const descriptionRaw = ctx.body.get('description')
    const linkRaw = ctx.body.get('link')
    const campaignIdRaw = ctx.body.get('campaign_id') ?? ctx.body.get('campaignId')
    const generateImageRaw = ctx.body.get('generate_image') ?? ctx.body.get('generateImage')
    const imageRaw = ctx.body.get('image')

    imageFile = imageRaw instanceof File && imageRaw.size > 0 ? imageRaw : null

    payloadInput = {
      ...(titleRaw !== null ? { title: String(titleRaw) } : {}),
      ...(descriptionRaw !== null ? { description: String(descriptionRaw) } : {}),
      ...(linkRaw !== null ? { link: String(linkRaw) } : {}),
      ...(campaignIdRaw !== null ? { campaignId: Number(campaignIdRaw) } : {}),
      ...(generateImageRaw !== null
        ? { generateImage: String(generateImageRaw).toLowerCase() === 'true' }
        : {}),
    }
  } else {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    payloadInput = {
      ...body,
      ...(body.campaign_id !== undefined ? { campaignId: Number(body.campaign_id) } : {}),
      ...(body.generate_image !== undefined ? { generateImage: Boolean(body.generate_image) } : {}),
    }
  }

  const payload = validate(updateCtaSchema, payloadInput)
  const updated = await ctaService.updateCta(ctx.companyId!, ctaId, payload, { imageFile })
  return raw(updated)
})

export const PUT = handler
export const PATCH = handler
