import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import * as scheduleRepository from '@/server/repositories/schedule.repository'

type CreateBulkSchedulePayload = {
  name: string
  startDate?: string
  intervalDays?: number
}

type UpdateBulkSchedulePayload = {
  name?: string
  startDate?: string | null
  intervalDays?: number | null
}

export class ScheduleService {
  async listSchedules(companyId: number) {
    return scheduleRepository.findBulkSchedules(companyId)
  }

  async createBulkSchedule(companyId: number, payload: CreateBulkSchedulePayload) {
    return scheduleRepository.createBulkSchedule({
      companyId,
      name: payload.name,
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      intervalDays: payload.intervalDays,
    })
  }

  async updateBulkSchedule(companyId: number, scheduleId: number, payload: UpdateBulkSchedulePayload) {
    const schedule = await prisma.bulkSchedule.findFirst({ where: { id: scheduleId, companyId } })
    if (!schedule) throw new NotFoundError('Bulk schedule not found')

    return scheduleRepository.updateBulkSchedule(scheduleId, {
      name: payload.name,
      startDate: payload.startDate === null ? null : payload.startDate ? new Date(payload.startDate) : undefined,
      intervalDays: payload.intervalDays,
    })
  }

  async assignToBulk(companyId: number, titleIds: number[], bulkScheduleId: number) {
    const schedule = await prisma.bulkSchedule.findFirst({ where: { id: bulkScheduleId, companyId } })
    if (!schedule) throw new NotFoundError('Bulk schedule not found')

    const count = await prisma.title.count({ where: { id: { in: titleIds }, companyId } })
    if (count !== titleIds.length) throw new ValidationError('One or more titles do not belong to company')

    return scheduleRepository.assignToBulk(titleIds, bulkScheduleId)
  }

  async removeFromBulk(companyId: number, titleIds: number[]) {
    const count = await prisma.title.count({ where: { id: { in: titleIds }, companyId } })
    if (count !== titleIds.length) throw new ValidationError('One or more titles do not belong to company')

    return scheduleRepository.removeFromBulk(titleIds)
  }

  async schedulePost(companyId: number, postId: number, date: string) {
    const post = await prisma.blogPost.findFirst({ where: { id: postId, companyId } })
    if (!post) throw new NotFoundError('Blog post not found')

    return scheduleRepository.schedulePost(postId, new Date(date))
  }

  async reschedulePost(companyId: number, postId: number, date: string) {
    const post = await prisma.blogPost.findFirst({ where: { id: postId, companyId } })
    if (!post) throw new NotFoundError('Blog post not found')

    return scheduleRepository.reschedulePost(postId, new Date(date))
  }

  async scheduleByInterval(companyId: number, titleIds: number[], startDate: string, intervalDays: number) {
    const count = await prisma.title.count({ where: { id: { in: titleIds }, companyId } })
    if (count !== titleIds.length) throw new ValidationError('One or more titles do not belong to company')

    return scheduleRepository.scheduleByInterval(titleIds, new Date(startDate), intervalDays)
  }

  async removeBulkSchedule(_companyId: number, _scheduleId: number) { throw new Error('TODO: implement removeBulkSchedule') }
  async assignTitlesToSchedule(_companyId: number, _scheduleId: number, _titleIds: number[]) { throw new Error('TODO: implement assignTitlesToSchedule') }
  async setInterval(_companyId: number, _scheduleId: number, _intervalDays: number) { throw new Error('TODO: implement setInterval') }
  async reschedule(_companyId: number, _payload: unknown) { throw new Error('TODO: implement reschedule') }
}

export const scheduleService = new ScheduleService()
