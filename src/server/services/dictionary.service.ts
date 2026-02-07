import { Prisma } from '@prisma/client'

import { NotFoundError, ValidationError } from '@/server/api/errors'
import { generateExplanation } from '@/server/ai/dictionary/generate-explanation'
import { generateKeywords } from '@/server/ai/dictionary/generate-keywords'
import { generateShortDescription } from '@/server/ai/dictionary/generate-short-description'
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

  async startKeywordGeneration(companyId: number, payload: unknown) {
    const body = payload as { title?: string; subject?: string; language?: string; num_words?: number }
    if (!body.title || !body.subject || !body.language || !body.num_words) {
      throw new ValidationError('Missing required fields')
    }

    const dictionary = await dictionaryRepository.create({
      title: body.title,
      subject: body.subject,
      language: body.language,
      num_words: body.num_words,
      companyId,
      current_letter: 'a',
    })

    const keywords = await this.generateKeywordsForLetter(dictionary.id, 'a')
    return { session_id: dictionary.id, letter: 'a', keywords }
  }

  async reviewKeywords(companyId: number, payload: unknown) {
    const body = payload as { session_id?: number; letter?: string; accepted?: boolean; removals?: number[] }
    if (!body.session_id || !body.letter || body.accepted === undefined) {
      throw new ValidationError('session_id, letter and accepted are required')
    }

    const dictionary = await this.getDictionary(body.session_id, companyId)
    const letter = body.letter.toLowerCase()

    if (body.accepted) {
      const words = dictionary.words.filter((w) => w.letter === letter)
      const removals = new Set(body.removals ?? [])
      if (removals.size) {
        const idsToDelete = words
          .map((w, idx) => ({ id: w.id, idx: idx + 1 }))
          .filter((v) => removals.has(v.idx))
          .map((v) => v.id)
        if (idsToDelete.length) await dictionaryRepository.deleteWords(idsToDelete)
      }

      const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1)
      if (nextLetter > 'z') return { message: 'All letters processed' }

      const keywords = await this.generateKeywordsForLetter(dictionary.id, nextLetter)
      await dictionaryRepository.update(dictionary.id, { current_letter: nextLetter })
      return { letter: nextLetter, keywords }
    }

    const keywords = await this.generateKeywordsForLetter(dictionary.id, letter)
    return { letter, keywords }
  }

  async completeKeywordGeneration(companyId: number, payload: unknown) {
    const body = payload as { session_id?: number }
    if (!body.session_id) throw new ValidationError('session_id is required')
    await this.getDictionary(body.session_id, companyId)
    return dictionaryRepository.update(body.session_id, { status: 'IN_PROGRESS' })
  }

  async generateDefinition(companyId: number, payload: unknown) {
    const body = payload as { session_id?: number; word?: string; include_priority_two?: boolean; batch_size?: number }
    if (!body.session_id) throw new ValidationError('session_id is required')
    const dictionary = await this.getDictionary(body.session_id, companyId)

    const includePriorityTwo = body.include_priority_two ?? false
    const batchSize = Math.min(20, Number(body.batch_size ?? 1))

    await dictionaryRepository.update(dictionary.id, { status: 'DEFINITION_GENERATION' })

    let words = dictionary.words
    if (!includePriorityTwo) words = words.filter((w) => w.priority === 'HIGH')
    if (body.word) {
      const ww = words.find((w) => w.keyword.toLowerCase() === body.word!.toLowerCase())
      words = ww ? [ww] : []
    } else {
      words = words.filter((w) => !w.definition).slice(0, batchSize)
    }

    if (!words.length) throw new NotFoundError('No words found that need definitions')

    const generated = [] as Array<{ word: string; definition: unknown }>
    for (const word of words) {
      const explanation = await generateExplanation(
        dictionary.subject,
        dictionary.language,
        word.keyword,
        word.description,
        word.focus_keyword ?? '',
      )

      await dictionaryRepository.upsertDefinition(word.id, {
        title: (explanation as any).seo_search ?? '',
        featured_google_snippet: (explanation as any).featured_google_snippet ?? '',
        meta_description: (explanation as any).meta_description ?? '',
        seo_title: (explanation as any).seo_title ?? '',
        title1: (explanation as any).paragraph_1?.title ?? '',
        text1: (explanation as any).paragraph_1?.text ?? '',
        title2: (explanation as any).paragraph_2?.title ?? '',
        text2: (explanation as any).paragraph_2?.text ?? '',
        title3: (explanation as any).paragraph_3?.title ?? '',
        text3: (explanation as any).paragraph_3?.text ?? '',
        synonyms: ((explanation as any).synonyms ?? []) as any,
        antonyms: ((explanation as any).antonyms ?? []) as any,
        usage_examples: ((explanation as any).usage_examples ?? []) as any,
        related_keywords: ((explanation as any).related_keywords ?? []) as any,
        faqs: ((explanation as any).faqs ?? []) as any,
      })

      generated.push({ word: word.keyword, definition: explanation })
    }

    const refreshed = await this.getDictionary(dictionary.id, companyId)
    const filtered = includePriorityTwo ? refreshed.words : refreshed.words.filter((w) => w.priority === 'HIGH')
    const remaining = filtered.filter((w) => !w.definition)

    return {
      generated_definitions: generated,
      next_word: remaining[0]?.keyword ?? null,
      remaining_definitions_count: remaining.length,
      total_words_count: filtered.length,
      generated_definitions_count: filtered.length - remaining.length,
    }
  }

  async generateNewKeyword(companyId: number, payload: unknown) {
    const body = payload as { session_id?: number; word?: string; priority?: number }
    if (!body.session_id) throw new ValidationError('session_id is required')
    if (!body.word?.trim()) throw new ValidationError('word is required')

    const dictionary = await this.getDictionary(body.session_id, companyId)
    const normalized = body.word
      .trim()
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('-')

    const description = await generateShortDescription(normalized, dictionary.subject, dictionary.language)
    const created = await dictionaryRepository.createWord({
      dictionaryId: dictionary.id,
      letter: normalized[0].toLowerCase(),
      keyword: normalized,
      description,
      priority: body.priority === 1 ? 'HIGH' : 'LOW',
    })

    return { word: created.keyword, description: created.description }
  }

  async generateNewKeywordDefinition(companyId: number, payload: unknown) {
    const body = payload as { session_id?: number; word?: string }
    if (!body.session_id) throw new ValidationError('session_id is required')
    const dictionary = await this.getDictionary(body.session_id, companyId)

    let target = dictionary.words.find((w) => w.priority === 'LOW' && !w.definition)
    if (body.word) {
      const normalized = body.word.trim().toLowerCase()
      target = dictionary.words.find((w) => w.priority === 'LOW' && w.keyword.toLowerCase() === normalized)
    }

    if (!target) throw new NotFoundError('Priority two word not found')

    return this.generateDefinition(companyId, {
      session_id: dictionary.id,
      word: target.keyword,
      include_priority_two: true,
      batch_size: 1,
    })
  }

  private async generateKeywordsForLetter(dictionaryId: number, letter: string) {
    const dictionary = await dictionaryRepository.findByIdAnyCompany(dictionaryId)
    if (!dictionary) throw new NotFoundError('Dictionary not found')

    const generated = await generateKeywords(letter, dictionary.num_words, dictionary.subject, dictionary.language)
    await dictionaryRepository.deleteWordsByLetter(dictionaryId, letter)

    const entries = Object.entries(generated as Record<string, any>).filter(
      ([, value]) => typeof value?.keyword === 'string' && value.keyword.toUpperCase().startsWith(letter.toUpperCase()),
    )

    for (const [, value] of entries) {
      await dictionaryRepository.createWord({
        dictionaryId,
        letter,
        keyword: value.keyword,
        description: value.description,
        focus_keyword: value.focus_keyword,
      })
    }

    return Object.fromEntries(entries)
  }
}

export const dictionaryService = new DictionaryService()
