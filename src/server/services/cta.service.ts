import { prisma } from '@/lib/prisma'
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
    return ctaRepository.findCTAs(companyId)
  }

  async createCta(companyId: number, payload: CreateCtaInput) {
    const campaign = await ctaRepository.findCampaignById(payload.campaignId)
    if (!campaign || campaign.companyId !== companyId) {
      throw new NotFoundError('Campaign not found')
    }

    return ctaRepository.createCTA(payload)
  }

  async updateCta(companyId: number, ctaId: number, payload: UpdateCtaInput) {
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

    return ctaRepository.updateCTA(ctaId, payload)
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
