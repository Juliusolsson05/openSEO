import { TitleStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/server/api/errors'
import { generateTitles as generateTitlesAI } from '@/server/ai/titles/generate-titles'
import * as titleRepository from '@/server/repositories/title.repository'

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
    return titleRepository.create({ companyId, ...data })
  }

  async updateTitle(id: number, companyId: number, data: UpdateTitlePayload) {
    const existing = await titleRepository.findById(id, companyId)
    if (!existing) throw new NotFoundError('Title not found')

    return titleRepository.update(id, data)
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

  async regenerateTitle(_companyId: number, _titleId: number) { throw new Error('TODO: implement regenerateTitle') }
}

export const titleService = new TitleService()
