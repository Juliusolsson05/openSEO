import { DictionaryStatus, type Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type DictionaryStatusFilter = 'all' | 'active' | 'completed'

type FindManyFilters = {
  search?: string
  page?: number
  pageSize?: number
  status?: DictionaryStatusFilter
}

function buildWhere(
  companyId: number,
  filters: { search?: string; status?: DictionaryStatusFilter },
): Prisma.DictionaryWhereInput {
  const status = filters.status ?? 'all'
  return {
    companyId,
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' as const } },
            { subject: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(status === 'completed'
      ? { status: DictionaryStatus.COMPLETED }
      : status === 'active'
      ? { status: { not: DictionaryStatus.COMPLETED } }
      : {}),
  }
}

export async function findMany(companyId: number, filters: FindManyFilters = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 50))

  const where = buildWhere(companyId, { search: filters.search, status: filters.status })

  const [items, total] = await Promise.all([
    prisma.dictionary.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { words: true },
        },
      },
    }),
    prisma.dictionary.count({ where }),
  ])

  return { items, total }
}

export async function countByStatus(
  companyId: number,
  filters: { search?: string } = {},
) {
  const baseWhere = buildWhere(companyId, { search: filters.search, status: 'all' })
  const [inProgress, completed] = await Promise.all([
    prisma.dictionary.count({
      where: { ...baseWhere, status: { not: DictionaryStatus.COMPLETED } },
    }),
    prisma.dictionary.count({
      where: { ...baseWhere, status: DictionaryStatus.COMPLETED },
    }),
  ])
  return { inProgress, completed }
}

export function findById(id: number, companyId: number) {
  return prisma.dictionary.findFirst({
    where: { id, companyId },
    include: {
      company: { select: { name: true } },
      words: {
        include: { definition: true },
        orderBy: [{ letter: 'asc' }, { keyword: 'asc' }],
      },
    },
  })
}

export function create(data: Prisma.DictionaryUncheckedCreateInput) {
  return prisma.dictionary.create({ data })
}

export function update(id: number, data: Prisma.DictionaryUncheckedUpdateInput) {
  return prisma.dictionary.update({ where: { id }, data })
}

export function findWord(dictionaryId: number, wordId: number) {
  return prisma.word.findFirst({
    where: { id: wordId, dictionaryId },
    include: { definition: true, dictionary: true },
  })
}

export function findWordById(wordId: number) {
  return prisma.word.findUnique({
    where: { id: wordId },
    include: { definition: true, dictionary: true },
  })
}

export function createWord(data: Prisma.WordUncheckedCreateInput) {
  return prisma.word.create({ data, include: { definition: true } })
}

export function updateWord(id: number, data: Prisma.WordUncheckedUpdateInput) {
  return prisma.word.update({ where: { id }, data, include: { definition: true } })
}

export function deleteWords(ids: number[]) {
  return prisma.word.deleteMany({ where: { id: { in: ids } } })
}

export function deleteWord(id: number) {
  return prisma.word.delete({ where: { id } })
}

export function deleteDictionary(id: number) {
  return prisma.dictionary.delete({ where: { id } })
}

export function findDefinition(wordId: number) {
  return prisma.dictionaryDefinition.findUnique({ where: { wordId } })
}

export function createDefinition(data: Prisma.DictionaryDefinitionUncheckedCreateInput) {
  return prisma.dictionaryDefinition.create({ data })
}

export function updateDefinition(wordId: number, data: Prisma.DictionaryDefinitionUncheckedUpdateInput) {
  return prisma.dictionaryDefinition.update({ where: { wordId }, data })
}

export function upsertDefinition(
  wordId: number,
  data: Omit<Prisma.DictionaryDefinitionUncheckedCreateInput, 'wordId'>,
) {
  return prisma.dictionaryDefinition.upsert({
    where: { wordId },
    update: data,
    create: { ...data, wordId },
  })
}

export function findByIdAnyCompany(id: number) {
  return prisma.dictionary.findUnique({
    where: { id },
    include: { words: { include: { definition: true } } },
  })
}

export function deleteWordsByLetter(dictionaryId: number, letter: string) {
  return prisma.word.deleteMany({ where: { dictionaryId, letter } })
}
