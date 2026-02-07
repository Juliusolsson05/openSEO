import { prisma } from '@/lib/prisma'

type CreateBulkScheduleArgs = {
  companyId: number
  name: string
  startDate?: Date
  intervalDays?: number
}

type UpdateBulkScheduleArgs = {
  name?: string
  startDate?: Date | null
  intervalDays?: number | null
}

export async function findBulkSchedules(companyId: number) {
  return prisma.bulkSchedule.findMany({
    where: { companyId },
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          titles: true,
          blog_posts: true,
        },
      },
    },
  })
}

export async function createBulkSchedule(data: CreateBulkScheduleArgs) {
  return prisma.bulkSchedule.create({
    data: {
      companyId: data.companyId,
      name: data.name,
      start_date: data.startDate,
      interval_days: data.intervalDays,
    },
  })
}

export async function updateBulkSchedule(id: number, data: UpdateBulkScheduleArgs) {
  return prisma.bulkSchedule.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.startDate !== undefined ? { start_date: data.startDate } : {}),
      ...(data.intervalDays !== undefined ? { interval_days: data.intervalDays } : {}),
    },
  })
}

export async function assignToBulk(titleIds: number[], bulkScheduleId: number) {
  return prisma.title.updateMany({
    where: { id: { in: titleIds } },
    data: { bulkScheduleId },
  })
}

export async function removeFromBulk(titleIds: number[]) {
  return prisma.title.updateMany({
    where: { id: { in: titleIds } },
    data: { bulkScheduleId: null },
  })
}

export async function schedulePost(postId: number, date: Date) {
  return prisma.blogPost.update({
    where: { id: postId },
    data: { scheduled_date: date },
  })
}

export async function reschedulePost(postId: number, date: Date) {
  return schedulePost(postId, date)
}

export async function scheduleByInterval(titleIds: number[], startDate: Date, intervalDays: number) {
  return prisma.$transaction(
    titleIds.map((titleId, index) => {
      const scheduledDate = new Date(startDate)
      scheduledDate.setDate(startDate.getDate() + index * intervalDays)

      return prisma.title.update({
        where: { id: titleId },
        data: { scheduled_date: scheduledDate },
      })
    }),
  )
}
