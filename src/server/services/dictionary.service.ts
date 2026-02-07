import type { Prisma } from '@prisma/client'

import { NotFoundError } from '@/server/api/errors'
import * as dictionaryRepository from '@/server/repositories/dictionary.repository'
import type {
  DeleteWordsInput,
  ModifyDictionaryInput,
  ModifyWordInput,
} from '@/server/validators/dictionary.validators'

export class DictionaryService {
  async listDictionaries(companyId: number) {
    return dictionaryRepository.findMany(companyId)
  }

  async getDictionary(id: number, companyId: number) {
    const dictionary = await dictionaryRepository.findById(id, companyId)
    if (!dictionary) {
      throw new NotFoundError('Dictionary not found')
    }

    return dictionary
  }

  async modifyDictionary(id: number, companyId: number, data: ModifyDictionaryInput) {
    await this.getDictionary(id, companyId)

    return dictionaryRepository.update(id, {
      ...data,
      ...(data.faqs !== undefined ? { faqs: data.faqs as Prisma.InputJsonValue } : {}),
    })
  }

  async getWord(dictionaryId: number, wordId: number, companyId: number) {
    await this.getDictionary(dictionaryId, companyId)

    const word = await dictionaryRepository.findWord(dictionaryId, wordId)
    if (!word) {
      throw new NotFoundError('Word not found')
    }

    return word
  }

  async modifyWord(wordId: number, companyId: number, data: ModifyWordInput) {
    const existing = await dictionaryRepository.findWord(data.dictionaryId, wordId)
    if (!existing || existing.dictionary.companyId !== companyId) {
      throw new NotFoundError('Word not found')
    }

    if (data.definition) {
      const definitionData = {
        ...data.definition,
        ...(data.definition.synonyms !== undefined
          ? { synonyms: data.definition.synonyms as Prisma.InputJsonValue }
          : {}),
        ...(data.definition.antonyms !== undefined
          ? { antonyms: data.definition.antonyms as Prisma.InputJsonValue }
          : {}),
        ...(data.definition.usage_examples !== undefined
          ? { usage_examples: data.definition.usage_examples as Prisma.InputJsonValue }
          : {}),
        ...(data.definition.related_keywords !== undefined
          ? { related_keywords: data.definition.related_keywords as Prisma.InputJsonValue }
          : {}),
        ...(data.definition.faqs !== undefined ? { faqs: data.definition.faqs as Prisma.InputJsonValue } : {}),
      }

      const definition = await dictionaryRepository.findDefinition(wordId)
      if (definition) {
        await dictionaryRepository.updateDefinition(wordId, definitionData)
      } else {
        await dictionaryRepository.createDefinition({
          wordId,
          ...definitionData,
        })
      }
    }

    return dictionaryRepository.updateWord(wordId, {
      dictionaryId: data.dictionaryId,
      ...(data.letter !== undefined ? { letter: data.letter } : {}),
      ...(data.keyword !== undefined ? { keyword: data.keyword } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.focus_keyword !== undefined ? { focus_keyword: data.focus_keyword } : {}),
    })
  }

  async deleteWords(payload: DeleteWordsInput, companyId: number) {
    const words = await Promise.all(payload.ids.map((id) => dictionaryRepository.findWord(payload.dictionaryId, id)))

    const invalid = words.some((word) => !word || word.dictionary.companyId !== companyId)
    if (invalid) {
      throw new NotFoundError('One or more words were not found')
    }

    return dictionaryRepository.deleteWords(payload.ids)
  }

  // TODO: AI generation endpoints
  async startKeywordGeneration(_dictionaryId: number, _companyId: number) {
    throw new Error('TODO: implement startKeywordGeneration')
  }

  async generateDefinition(_wordId: number, _companyId: number) {
    throw new Error('TODO: implement generateDefinition')
  }
}

export const dictionaryService = new DictionaryService()
