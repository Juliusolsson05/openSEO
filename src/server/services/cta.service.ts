import { prisma } from '@/lib/prisma'
import { generateIdeogramImage } from '@/server/ai/image/generate-image'
import { uploadFromBinary, uploadFromUrl } from '@/server/storage/upload'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import * as ctaRepository from '@/server/repositories/cta.repository'
import { serializeElement } from '@/server/utils/element-type'
import type {
  CreateCampaignInput,
  CreateCtaInput,
  UpdateCampaignInput,
  UpdateCtaInput,
} from '@/server/validators/cta.validators'

export class CtaService {
  async listCampaigns(companyId: number) {
    return ctaRepository.findCampaigns(companyId)
  }

  async createCampaign(companyId: number, payload: CreateCampaignInput) {
    return ctaRepository.createCampaign({ ...payload, companyId })
  }

  async updateCampaign(companyId: number, campaignId: number, payload: UpdateCampaignInput) {
    const campaign = await ctaRepository.findCampaignById(campaignId)
    if (!campaign || campaign.companyId !== companyId) {
      throw new NotFoundError('Campaign not found')
    }

    return ctaRepository.updateCampaign(campaignId, payload)
  }

  async deleteCampaign(companyId: number, campaignId: number) {
    const campaign = await ctaRepository.findCampaignById(campaignId)
    if (!campaign || campaign.companyId !== companyId) {
      throw new NotFoundError('Campaign not found')
    }

    return ctaRepository.deleteCampaign(campaignId)
  }

  async listCtas(companyId: number) {
    // Legacy parity: this endpoint returns campaigns with nested CTAs.
    return ctaRepository.findCampaigns(companyId)
  }

  private async resolveCtaImage(options: {
    companyId: number
    imageFile?: File | null
    imageUrl?: string | null
    generateImage?: boolean
    title: string
    description: string
    existingImage?: string | null
  }) {
    if (options.imageFile) {
      const uploaded = await uploadFromBinary(options.imageFile, options.companyId, 'cta')
      if (!uploaded) throw new ValidationError('Failed to upload CTA image')
      return uploaded
    }

    if (options.imageUrl) {
      const uploaded = await uploadFromUrl(options.imageUrl, options.companyId, 'cta')
      if (!uploaded) throw new ValidationError('Failed to upload CTA image URL')
      return uploaded
    }

    if (options.generateImage) {
      const prompt = `Create a conversion-focused call-to-action visual. Title: ${options.title}. Description: ${options.description}. Clean modern UI-style marketing image.`
      const generated = await generateIdeogramImage(prompt, 2, true)
      const generatedUrl = (generated as any)?.url as string | undefined
      if (!generatedUrl) throw new ValidationError('Failed to generate CTA image')
      const uploaded = await uploadFromUrl(generatedUrl, options.companyId, 'cta')
      if (!uploaded) throw new ValidationError('Failed to upload generated CTA image')
      return uploaded
    }

    return options.existingImage ?? null
  }

  async createCta(
    companyId: number,
    payload: CreateCtaInput,
    options?: { imageFile?: File | null; imageUrl?: string | null },
  ) {
    const campaign = await ctaRepository.findCampaignById(payload.campaignId)
    if (!campaign || campaign.companyId !== companyId) {
      throw new NotFoundError('Campaign not found')
    }

    const image = await this.resolveCtaImage({
      companyId,
      imageFile: options?.imageFile,
      imageUrl: options?.imageUrl,
      generateImage: payload.generateImage,
      title: payload.title,
      description: payload.description,
      existingImage: payload.image ?? null,
    })

    if (!image) {
      throw new ValidationError('CTA image is required (upload one or enable generate image).')
    }

    return ctaRepository.createCTA({
      campaignId: payload.campaignId,
      title: payload.title,
      description: payload.description,
      link: payload.link,
      image,
    })
  }

  async updateCta(
    companyId: number,
    ctaId: number,
    payload: UpdateCtaInput,
    options?: { imageFile?: File | null; imageUrl?: string | null },
  ) {
    const cta = await ctaRepository.findCTAById(ctaId)
    if (!cta || cta.campaign.companyId !== companyId) {
      throw new NotFoundError('CTA not found')
    }

    if (payload.campaignId !== undefined) {
      const targetCampaign = await ctaRepository.findCampaignById(payload.campaignId)
      if (!targetCampaign || targetCampaign.companyId !== companyId) {
        throw new NotFoundError('Target campaign not found')
      }
    }

    const nextTitle = payload.title ?? cta.title
    const nextDescription = payload.description ?? cta.description

    const image = await this.resolveCtaImage({
      companyId,
      imageFile: options?.imageFile,
      imageUrl: options?.imageUrl,
      generateImage: payload.generateImage,
      title: nextTitle,
      description: nextDescription,
      existingImage: payload.image ?? cta.image,
    })

    const updatePayload: UpdateCtaInput = {
      ...payload,
      ...(image ? { image } : {}),
    }

    return ctaRepository.updateCTA(ctaId, updatePayload)
  }

  async deleteCta(companyId: number, ctaId: number) {
    const cta = await ctaRepository.findCTAById(ctaId)
    if (!cta || cta.campaign.companyId !== companyId) {
      throw new NotFoundError('CTA not found')
    }

    return ctaRepository.deleteCTA(ctaId)
  }

  async addCtaToPost(companyId: number, blogPostId: number, elementId: number, ctaId: number) {
    if (!blogPostId || !elementId || !ctaId) {
      throw new ValidationError('blog_post_id, element_id, and cta_id are required')
    }

    const blogPost = await prisma.blogPost.findFirst({
      where: { id: blogPostId, companyId },
      select: { id: true },
    })
    if (!blogPost) throw new NotFoundError('Blog post not found')

    const targetElement = await prisma.blogPostElement.findFirst({
      where: { id: elementId, blogPostId },
      select: { id: true, order: true },
    })
    if (!targetElement) throw new NotFoundError('Target element not found')

    const cta = await prisma.cTA.findFirst({
      where: {
        id: ctaId,
        campaign: { companyId },
      },
      select: { id: true, title: true, description: true, image: true, link: true },
    })
    if (!cta) throw new NotFoundError('CTA not found')

    const created = await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.updateMany({
        where: {
          blogPostId,
          order: { gt: targetElement.order },
        },
        data: {
          order: { increment: 1 },
        },
      })

      return tx.blogPostElement.create({
        data: {
          blogPostId,
          element_type: 'CTA' as any,
          order: targetElement.order + 1,
          content: {
            cta_id: cta.id,
            title: cta.title,
            description: cta.description,
            image_url: cta.image,
            target_url: cta.link,
            // Backward compatibility aliases
            image: cta.image,
            link: cta.link,
          },
        },
      })
    })

    return serializeElement(created)
  }
}

export const ctaService = new CtaService()
