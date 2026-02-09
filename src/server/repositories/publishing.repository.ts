import { prisma } from '@/lib/prisma'

export async function findCompany(companyId: number) {
  return prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      website_url: true,
      language: true,
      api_endpoint: true,
      api_key: true,
      metadata: true,
      created_at: true,
      updated_at: true,
    },
  })
}

export async function updateCompany(companyId: number, data: Record<string, unknown>) {
  return prisma.company.update({ where: { id: companyId }, data })
}

export async function findPublishMapping(blogPostId: number) {
  return prisma.blogPublish.findFirst({ where: { blogPostId } })
}

export async function upsertPublishMapping(blogPostId: number, remoteId: string) {
  const existing = await findPublishMapping(blogPostId)
  if (existing) {
    return prisma.blogPublish.update({ where: { id: existing.id }, data: { remote_id: remoteId } })
  }
  return prisma.blogPublish.create({ data: { blogPostId, remote_id: remoteId } })
}
