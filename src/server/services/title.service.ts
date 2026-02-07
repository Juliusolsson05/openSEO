import type { TitleStatus } from '@prisma/client'

import { NotFoundError } from '@/server/api/errors'
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

  async generateTitles(_companyId: number, _payload: unknown) { throw new Error('TODO: implement generateTitles') }
  async regenerateTitle(_companyId: number, _titleId: number) { throw new Error('TODO: implement regenerateTitle') }
}

export const titleService = new TitleService()
