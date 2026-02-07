import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export function findCampaigns(companyId: number) {
  return prisma.campaign.findMany({
    where: { companyId },
    include: { ctas: true },
    orderBy: { updated_at: 'desc' },
  })
}

export function createCampaign(data: Prisma.CampaignUncheckedCreateInput) {
  return prisma.campaign.create({ data, include: { ctas: true } })
}

export function updateCampaign(id: number, data: Prisma.CampaignUncheckedUpdateInput) {
  return prisma.campaign.update({ where: { id }, data, include: { ctas: true } })
}

export function deleteCampaign(id: number) {
  return prisma.campaign.delete({ where: { id } })
}

export function findCampaignById(id: number) {
  return prisma.campaign.findUnique({ where: { id } })
}

export function findCTAs(companyId: number) {
  return prisma.cTA.findMany({
    where: { campaign: { companyId } },
    include: { campaign: true },
    orderBy: { updated_at: 'desc' },
  })
}

export function findCTAById(id: number) {
  return prisma.cTA.findUnique({ where: { id }, include: { campaign: true } })
}

export function createCTA(data: Prisma.CTAUncheckedCreateInput) {
  return prisma.cTA.create({ data, include: { campaign: true } })
}

export function updateCTA(id: number, data: Prisma.CTAUncheckedUpdateInput) {
  return prisma.cTA.update({ where: { id }, data, include: { campaign: true } })
}

export function deleteCTA(id: number) {
  return prisma.cTA.delete({ where: { id } })
}
