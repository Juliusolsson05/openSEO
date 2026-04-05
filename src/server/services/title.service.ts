import { TitleStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/server/api/errors'
import { generateTitles as generateTitlesAI } from '@/server/ai/titles/generate-titles'
import { generateSingleTitle } from '@/server/ai/titles/generate-single-title'
import * as titleRepository from '@/server/repositories/title.repository'
import { assertCategoryOwnership } from '@/server/services/_helpers/assert-category-ownership'

type ListTitlesQuery = {
  page: number
  pageSize: number
  status?: TitleStatus
  search?: string
}

type CreateTitlePayload = {
  titleText: string
  seoTitle?: string
  focusKeyword?: string
  categoryIds?: number[]
}

type UpdateTitlePayload = {
  titleText?: string
  seoTitle?: string | null
  focusKeyword?: string | null
  status?: TitleStatus
  categoryIds?: number[]
}

export class TitleService {
  async listTitles(companyId: number, query: ListTitlesQuery) {
    const [items, total] = await Promise.all([
      titleRepository.findMany(companyId, query),
      titleRepository.count(companyId, {
        status: query.status,
        search: query.search,
      }),
    ])

    return { items, total }
  }

  async getTitle(id: number, companyId: number) {
    const title = await titleRepository.findById(id, companyId)
    if (!title) throw new NotFoundError('Title not found')
    return title
  }

  async createTitle(companyId: number, data: CreateTitlePayload) {
    await assertCategoryOwnership(prisma, companyId, data.categoryIds)
    return titleRepository.create({ companyId, ...data })
  }

  async updateTitle(id: number, companyId: number, data: UpdateTitlePayload) {
    const existing = await titleRepository.findById(id, companyId)
    if (!existing) throw new NotFoundError('Title not found')

    await assertCategoryOwnership(prisma, companyId, data.categoryIds)
    return titleRepository.update(id, companyId, data)
  }

  async deleteTitle(id: number, companyId: number) {
    const deleted = await titleRepository.remove(id, companyId)
    if (!deleted) throw new NotFoundError('Title not found')
    return deleted
  }

  async generateTitles(companyId: number, payload: {
    businessType?: string
    keywords?: string[]
    language?: string
    amount?: number
  }) {
    const company = await prisma.company.findUnique({ where: { id: companyId } })
    if (!company) throw new NotFoundError('Company not found')

    const businessType = payload.businessType ?? company.business_type
    const language = payload.language ?? company.language ?? 'en'
    const amount = payload.amount ?? 10
    const keywords = payload.keywords ?? (Array.isArray(company.keywords) ? (company.keywords as string[]) : [])

    const industryPrompt = [businessType, ...keywords].filter(Boolean).join(', ')
    const existingTitles = await prisma.title.findMany({ where: { companyId }, select: { title_text: true } })

    const generated = await generateTitlesAI(industryPrompt, amount, language, existingTitles.map((t) => t.title_text))

    return prisma.$transaction(async (tx) => {
      const created = [] as Awaited<ReturnType<typeof tx.title.create>>[]
      for (let i = 1; i <= amount; i += 1) {
        const item = (generated as Record<string, any>)[`title_${i}`]
        if (!item?.title_text) continue
        const title = await titleRepository.createWithClient(tx, {
          companyId,
          titleText: item.title_text,
          seoTitle: item.seo_title,
          focusKeyword: item.focus_keyword,
          status: TitleStatus.TO_BE_GENERATED,
        })
        created.push(title)
      }
      return created
    })
  }

  async regenerateTitle(companyId: number, titleId: number) {
    const company = await prisma.company.findUnique({ where: { id: companyId } })
    if (!company) throw new NotFoundError('Company not found')

    const title = await prisma.title.findFirst({ where: { id: titleId, companyId } })
    if (!title) throw new NotFoundError('Title not found')

    const existingTitles = await prisma.title.findMany({ where: { companyId }, select: { title_text: true } })
    const generated = await generateSingleTitle(
      company.business_type,
      existingTitles.map((t) => t.title_text),
      company.language ?? 'en',
    )

    return prisma.title.update({
      where: { id: titleId },
      data: {
        title_text: generated.title_text,
        seo_title: generated.seo_title,
        focus_keyword: generated.focus_keyword,
      },
    })
  }
}

export const titleService = new TitleService()
