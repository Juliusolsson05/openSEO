import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export function findMany(companyId: number) {
  return prisma.dictionary.findMany({
    where: { companyId },
    orderBy: { id: 'desc' },
    include: {
      _count: {
        select: { words: true },
      },
    },
  })
}

export function findById(id: number, companyId: number) {
  return prisma.dictionary.findFirst({
    where: { id, companyId },
    include: {
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

export function createWord(data: Prisma.WordUncheckedCreateInput) {
  return prisma.word.create({ data, include: { definition: true } })
}

export function updateWord(id: number, data: Prisma.WordUncheckedUpdateInput) {
  return prisma.word.update({ where: { id }, data, include: { definition: true } })
}

export function deleteWords(ids: number[]) {
  return prisma.word.deleteMany({ where: { id: { in: ids } } })
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
