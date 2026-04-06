import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { generateExplanation } from '@/server/ai/dictionary/generate-explanation'
import { generateKeywords } from '@/server/ai/dictionary/generate-keywords'
import { generateShortDescription } from '@/server/ai/dictionary/generate-short-description'
import { sendJsonWebhook } from '@/server/services/webhook-delivery.service'
import * as dictionaryRepository from '@/server/repositories/dictionary.repository'
import { toDjangoDictionaryStatus } from '@/server/utils/dictionary'
import type {
  DeleteWordsInput,
  ModifyDictionaryInput,
  ModifyWordInput,
} from '@/server/validators/dictionary.validators'

export type DictionaryListStatusFilter = 'all' | 'active' | 'completed'

export class DictionaryService {
  async listDictionaries(
    companyId: number,
    query?: { search?: string; page?: number; pageSize?: number; status?: DictionaryListStatusFilter },
  ) {
    const page = Math.max(1, query?.page ?? 1)
    const pageSize = Math.max(1, Math.min(100, query?.pageSize ?? 20))
    const status = query?.status ?? 'all'

    const [{ items, total }, statusCounts] = await Promise.all([
      dictionaryRepository.findMany(companyId, { ...query, page, pageSize, status }),
      dictionaryRepository.countByStatus(companyId, { search: query?.search }),
    ])

    return {
      dictionaries: items.map((d) => ({
        id: d.id,
        title: d.title,
        subject: d.subject,
        language: d.language,
        num_words: d.num_words,
        total_words: d.num_words * 26,
        in_progress: !['COMPLETED', 'UPLOADED'].includes(String(d.status)),
        current_letter: d.current_letter,
        status: toDjangoDictionaryStatus(String(d.status)),
      })),
      total,
      inProgressTotal: statusCounts.inProgress,
      completedTotal: statusCounts.completed,
      page,
      pageSize,
    }
  }

  async getDictionary(id: number, companyId: number) {
    const dictionary = await dictionaryRepository.findById(id, companyId)
    if (!dictionary) {
      throw new NotFoundError('Dictionary not found')
    }

    return dictionary
  }

  async getDictionaryDetail(id: number, companyId: number) {
    const dictionary = await this.getDictionary(id, companyId)
    return {
      id: dictionary.id,
      title: dictionary.title,
      subject: dictionary.subject,
      language: dictionary.language,
      num_words: dictionary.num_words,
      current_letter: dictionary.current_letter,
      status: toDjangoDictionaryStatus(String(dictionary.status)),
      company: dictionary.company?.name ?? null,
      words: dictionary.words.map((word) => ({
        id: word.id,
        letter: word.letter,
        keyword: word.keyword,
        description: word.description,
        priority: word.priority === 'HIGH' ? 1 : 2,
        has_definition: Boolean(word.definition),
      })),
    }
  }

  async modifyDictionary(id: number, companyId: number, data: ModifyDictionaryInput) {
    await this.getDictionary(id, companyId)

    return dictionaryRepository.update(id, {
      ...data,
      ...(data.faqs !== undefined ? { faqs: data.faqs as Prisma.InputJsonValue } : {}),
    })
  }

  async modifyDictionaryDetail(id: number, companyId: number, data: ModifyDictionaryInput) {
    await this.modifyDictionary(id, companyId, data)
    const updated = await this.getDictionary(id, companyId)

    return {
      id: updated.id,
      title: updated.title,
      subject: updated.subject,
      language: updated.language,
      num_words: updated.num_words,
      current_letter: updated.current_letter,
      status: toDjangoDictionaryStatus(String(updated.status)),
      company: updated.company?.name ?? null,
    }
  }

  async getWord(dictionaryId: number, wordId: number, companyId: number) {
    await this.getDictionary(dictionaryId, companyId)

    const word = await dictionaryRepository.findWord(dictionaryId, wordId)
    if (!word) {
      throw new NotFoundError('Word not found')
    }

    return word
  }

  async modifyWord(wordId: number, companyId: number, data: Partial<ModifyWordInput>) {
    const existing = await dictionaryRepository.findWordById(wordId)
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
      ...(data.dictionaryId !== undefined ? { dictionaryId: data.dictionaryId } : {}),
      ...(data.letter !== undefined ? { letter: data.letter } : {}),
      ...(data.keyword !== undefined ? { keyword: data.keyword } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.focus_keyword !== undefined ? { focus_keyword: data.focus_keyword } : {}),
    })
  }

  async deleteWords(payload: DeleteWordsInput, companyId: number) {
    const dictionary = await this.getDictionary(payload.dictionaryId, companyId)
    const words = await Promise.all(payload.ids.map((id) => dictionaryRepository.findWord(payload.dictionaryId, id)))

    const invalid = words.some((word) => !word || word.dictionary.companyId !== companyId)
    if (invalid) {
      throw new NotFoundError('One or more words were not found')
    }

    const removed = await dictionaryRepository.deleteWords(payload.ids)
    const refreshed = await this.getDictionary(dictionary.id, companyId)

    return {
      detail: `${removed.count} words successfully removed from the dictionary`,
      // `num_words` is words-per-letter, not a total. Kept for API back-compat.
      new_word_count: refreshed.num_words,
    }
  }

  async deleteDictionary(id: number, companyId: number) {
    await this.getDictionary(id, companyId)
    await dictionaryRepository.deleteDictionary(id)
  }

  async deleteWord(wordId: number, companyId: number) {
    const word = await dictionaryRepository.findWordById(wordId)
    if (!word || word.dictionary.companyId !== companyId) {
      throw new NotFoundError('Word not found')
    }

    await dictionaryRepository.deleteWord(wordId)

    // NOTE: `num_words` is words-per-letter (used by generation) and MUST NOT be
    // overwritten with the total word count. The total is derived on read as
    // `num_words * 26` in listDictionaries.
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

  async uploadDictionary(companyId: number, payload: unknown) {
    const body = (payload ?? {}) as Record<string, unknown>
    const dictionaryId = Number(body.dictionary_id)
    if (!dictionaryId) throw new ValidationError('dictionary_id is required')

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { api_endpoint: true, api_key: true },
    })
    if (!company?.api_endpoint) {
      throw new ValidationError('Publishing endpoint is not configured. Set it in Settings → API Configuration.')
    }

    const exportData = await this.exportAll(companyId, dictionaryId)

    const delivery = await sendJsonWebhook({
      endpoint: company.api_endpoint,
      apiKey: company.api_key,
      eventType: 'dictionary.upsert',
      payload: {
        dictionary: exportData.dictionary_info,
        terms: exportData.words,
      },
    })

    if (!delivery.ok) {
      throw new ValidationError(`Publishing endpoint returned HTTP ${delivery.status}`)
    }

    return {
      status: `Successfully published dictionary "${exportData.dictionary_info.title}" (${exportData.words.length} words)`,
      delivery: {
        remote_id: delivery.deliveryId,
        endpoint_status: delivery.status,
      },
    }
  }

  async uploadAll(companyId: number) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { api_endpoint: true, api_key: true },
    })
    if (!company?.api_endpoint) {
      throw new ValidationError('Publishing endpoint is not configured. Set it in Settings → API Configuration.')
    }

    const dictionaries = await prisma.dictionary.findMany({
      where: { companyId },
      select: { id: true, title: true },
    })

    const results = []
    const errors = []

    for (const dict of dictionaries) {
      try {
        const exportData = await this.exportAll(companyId, dict.id)
        const delivery = await sendJsonWebhook({
          endpoint: company.api_endpoint,
          apiKey: company.api_key,
          eventType: 'dictionary.upsert',
          payload: {
            dictionary: exportData.dictionary_info,
            terms: exportData.words,
          },
        })

        if (!delivery.ok) {
          errors.push({ dictionary_id: dict.id, error: `HTTP ${delivery.status}` })
        } else {
          results.push({ dictionary_id: dict.id, title: dict.title, remote_id: delivery.deliveryId })
        }
      } catch (e) {
        errors.push({ dictionary_id: dict.id, error: e instanceof Error ? e.message : String(e) })
      }
    }

    return { status: 'Sync completed', synced: results, errors, total: dictionaries.length }
  }

  async exportWord(companyId: number, dictionaryId: number, wordInput: string) {
    const word = await prisma.word.findFirst({
      where: { dictionaryId, keyword: { equals: wordInput, mode: 'insensitive' }, dictionary: { companyId } },
      include: { definition: true, dictionary: true },
    })
    if (!word || !word.dictionary) throw new NotFoundError('Dictionary not found')
    if (!word.definition) {
      return { detail: `No definition found for the word "${word.keyword}" in dictionary "${word.dictionary.title}"` }
    }

    return {
      dictionary_info: { id: word.dictionary.id, title: word.dictionary.title, subject: word.dictionary.subject, language: word.dictionary.language },
      word_data: {
        id: word.id,
        letter: word.letter,
        keyword: word.keyword,
        description: word.description,
        priority: word.priority === 'HIGH' ? 1 : 2,
        definition: {
          title: word.definition.title,
          seo_title: word.definition.seo_title,
          featured_google_snippet: word.definition.featured_google_snippet,
          meta_description: word.definition.meta_description,
          paragraph_1: { title: word.definition.title1, text: word.definition.text1 },
          paragraph_2: { title: word.definition.title2, text: word.definition.text2 },
          paragraph_3: { title: word.definition.title3, text: word.definition.text3 },
          synonyms: word.definition.synonyms,
          antonyms: word.definition.antonyms,
          usage_examples: word.definition.usage_examples,
          related_keywords: word.definition.related_keywords,
          faqs: word.definition.faqs,
        },
      },
    }
  }

  async exportAll(companyId: number, dictionaryId: number) {
    const dictionary = await prisma.dictionary.findFirst({
      where: { id: dictionaryId, companyId },
      include: { words: { where: { definition: { isNot: null } }, include: { definition: true }, orderBy: { id: 'asc' } } },
    })
    if (!dictionary) throw new NotFoundError('Dictionary not found')

    const words = dictionary.words.filter((w) => w.definition)
    return {
      dictionary_info: {
        id: dictionary.id,
        title: dictionary.title,
        subject: dictionary.subject,
        language: dictionary.language,
        num_words: dictionary.num_words,
        current_letter: dictionary.current_letter,
        status: toDjangoDictionaryStatus(String(dictionary.status)),
      },
      words: words.map((word) => ({
        id: word.id,
        letter: word.letter,
        keyword: word.keyword,
        description: word.description,
        priority: word.priority === 'HIGH' ? 1 : 2,
        definition: {
          title: word.definition!.title,
          seo_title: word.definition!.seo_title,
          featured_google_snippet: word.definition!.featured_google_snippet,
          meta_description: word.definition!.meta_description,
          paragraph_1: { title: word.definition!.title1, text: word.definition!.text1 },
          paragraph_2: { title: word.definition!.title2, text: word.definition!.text2 },
          paragraph_3: { title: word.definition!.title3, text: word.definition!.text3 },
          synonyms: word.definition!.synonyms,
          antonyms: word.definition!.antonyms,
          usage_examples: word.definition!.usage_examples,
          related_keywords: word.definition!.related_keywords,
          faqs: word.definition!.faqs,
        },
      })),
      stats: {
        total_words: words.length,
        words_with_definitions: words.length,
        words_with_complete_data: words.filter((w) => w.definition?.title && w.definition?.seo_title && w.definition?.meta_description && w.definition?.title1 && w.definition?.text1).length,
      },
    }
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
