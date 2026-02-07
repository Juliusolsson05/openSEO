import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { createCtaSchema } from '@/server/validators/cta.validators'

const handler = apiHandler(async (ctx) => {
  let payloadInput: Record<string, unknown> = {}
  let imageFile: File | null = null

  if (ctx.body instanceof FormData) {
    const campaignIdRaw = ctx.body.get('campaign_id') ?? ctx.body.get('campaignId')
    const titleRaw = ctx.body.get('title')
    const descriptionRaw = ctx.body.get('description')
    const linkRaw = ctx.body.get('link')
    const generateImageRaw = ctx.body.get('generate_image') ?? ctx.body.get('generateImage')
    const imageRaw = ctx.body.get('image')

    imageFile = imageRaw instanceof File && imageRaw.size > 0 ? imageRaw : null

    payloadInput = {
      campaignId: Number(campaignIdRaw),
      title: String(titleRaw ?? ''),
      description: String(descriptionRaw ?? ''),
      link: String(linkRaw ?? ''),
      generateImage: String(generateImageRaw ?? '').toLowerCase() === 'true',
    }
  } else {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    payloadInput = {
      ...body,
      ...(body.campaign_id !== undefined ? { campaignId: Number(body.campaign_id) } : {}),
      ...(body.generate_image !== undefined ? { generateImage: Boolean(body.generate_image) } : {}),
    }
  }

  const payload = validate(createCtaSchema, payloadInput)
  const created = await ctaService.createCta(ctx.companyId!, payload, { imageFile })
  return raw(created, 201)
})

export const POST = handler
