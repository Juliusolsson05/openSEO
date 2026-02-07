import { NotFoundError } from '@/server/api/errors'
import * as ctaRepository from '@/server/repositories/cta.repository'
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
}

export const ctaService = new CtaService()
