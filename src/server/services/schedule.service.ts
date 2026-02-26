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

  async removeBulkSchedule(companyId: number, scheduleId: number) {
    const schedule = await prisma.bulkSchedule.findFirst({ where: { id: scheduleId, companyId } })
    if (!schedule) throw new NotFoundError('Bulk schedule not found')

    // Unlink all titles first, then delete the schedule
    await prisma.title.updateMany({
      where: { bulkScheduleId: scheduleId },
      data: { bulkScheduleId: null },
    })

    return prisma.bulkSchedule.delete({ where: { id: scheduleId } })
  }

  async assignTitlesToSchedule(companyId: number, scheduleId: number, titleIds: number[]) {
    const schedule = await prisma.bulkSchedule.findFirst({ where: { id: scheduleId, companyId } })
    if (!schedule) throw new NotFoundError('Bulk schedule not found')

    const count = await prisma.title.count({ where: { id: { in: titleIds }, companyId } })
    if (count !== titleIds.length) throw new ValidationError('One or more titles do not belong to company')

    return scheduleRepository.assignToBulk(titleIds, scheduleId)
  }

  async setInterval(companyId: number, scheduleId: number, intervalDays: number) {
    const schedule = await prisma.bulkSchedule.findFirst({ where: { id: scheduleId, companyId } })
    if (!schedule) throw new NotFoundError('Bulk schedule not found')

    if (intervalDays < 1) throw new ValidationError('Interval must be at least 1 day')

    return prisma.bulkSchedule.update({
      where: { id: scheduleId },
      data: { interval_days: intervalDays },
    })
  }

  async reschedule(companyId: number, payload: { scheduleId: number; startDate: string }) {
    const schedule = await prisma.bulkSchedule.findFirst({
      where: { id: payload.scheduleId, companyId },
      include: { titles: { select: { id: true }, orderBy: { id: 'asc' } } },
    })
    if (!schedule) throw new NotFoundError('Bulk schedule not found')

    const intervalDays = schedule.interval_days ?? 7
    const startDate = new Date(payload.startDate)

    await prisma.$transaction(
      schedule.titles.map((title, index) => {
        const scheduledDate = new Date(startDate)
        scheduledDate.setDate(startDate.getDate() + index * intervalDays)

        return prisma.title.update({
          where: { id: title.id },
          data: { scheduled_date: scheduledDate },
        })
      }),
    )

    return prisma.bulkSchedule.update({
      where: { id: payload.scheduleId },
      data: { start_date: startDate },
    })
  }
}

export const scheduleService = new ScheduleService()
