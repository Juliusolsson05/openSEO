import { readInboundKey, type InboundEnvelope, type InboundTermPayload } from '@/types/publishing'
import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { raw, success } from '@/server/api/response'
import { resolveCompanyByInboundApiKey } from '@/server/publishing/auth'


export const POST = apiHandler(async ({ body }, req) => {
  const inboundKey = readInboundKey(req.headers)
  if (!inboundKey) return raw({ detail: 'Missing inbound API key' }, 401)

  const companyId = await resolveCompanyByInboundApiKey(inboundKey)
  if (!companyId) return raw({ detail: 'Invalid inbound API key' }, 401)

  const envelope = (body ?? {}) as InboundEnvelope<InboundTermPayload>
  if (!envelope.event_id) throw new ValidationError('event_id is required')

  const existingInbound = await prisma.inboundEvent.findFirst({
    where: { companyId, event_id: envelope.event_id },
    select: { id: true, processed: true },
  })

  if (existingInbound?.processed) {
    return success({ status: 'duplicate_ignored', event_id: envelope.event_id })
  }

  const dictionaryPayload = envelope.payload?.dictionary
  const termPayload = envelope.payload?.term
  if (!dictionaryPayload || !termPayload) {
    throw new ValidationError('payload.dictionary and payload.term are required')
  }

  let dictionary = null as Awaited<ReturnType<typeof prisma.dictionary.findFirst>>
  if (dictionaryPayload.id) {
    dictionary = await prisma.dictionary.findFirst({ where: { id: dictionaryPayload.id, companyId } })
  }
  if (!dictionary && dictionaryPayload.title) {
    dictionary = await prisma.dictionary.findFirst({ where: { title: dictionaryPayload.title, companyId } })
  }
  if (!dictionary) throw new ValidationError('Dictionary not found for this company')

  let word = null as Awaited<ReturnType<typeof prisma.word.findFirst>>
  if (termPayload.id) {
    word = await prisma.word.findFirst({ where: { id: termPayload.id, dictionaryId: dictionary.id } })
  }
  if (!word && termPayload.keyword) {
    word = await prisma.word.findFirst({ where: { dictionaryId: dictionary.id, keyword: termPayload.keyword } })
  }

  if (!word) {
    if (!termPayload.keyword || !termPayload.description) {
      throw new ValidationError('For create, term keyword/description are required')
    }

    word = await prisma.word.create({
      data: {
        dictionaryId: dictionary.id,
        keyword: termPayload.keyword,
        letter: termPayload.letter ?? termPayload.keyword[0]?.toLowerCase() ?? 'a',
        description: termPayload.description,
        priority: termPayload.priority ?? 'LOW',
        focus_keyword: termPayload.focus_keyword,
      },
    })
  } else {
    word = await prisma.word.update({
      where: { id: word.id },
      data: {
        ...(termPayload.keyword !== undefined ? { keyword: termPayload.keyword } : {}),
        ...(termPayload.letter !== undefined ? { letter: termPayload.letter } : {}),
        ...(termPayload.description !== undefined ? { description: termPayload.description } : {}),
        ...(termPayload.priority !== undefined ? { priority: termPayload.priority } : {}),
        ...(termPayload.focus_keyword !== undefined ? { focus_keyword: termPayload.focus_keyword } : {}),
      },
    })
  }

  if (termPayload.definition) {
    const def = termPayload.definition
    const existingDef = await prisma.dictionaryDefinition.findUnique({ where: { wordId: word.id } })
    const data = {
      title: def.title ?? '',
      featured_google_snippet: def.featured_google_snippet ?? '',
      meta_description: def.meta_description ?? '',
      seo_title: def.seo_title ?? '',
      title1: '',
      text1: '',
      title2: '',
      text2: '',
      title3: '',
      text3: '',
      synonyms: (def.synonyms ?? []) as object,
      antonyms: (def.antonyms ?? []) as object,
      usage_examples: (def.usage_examples ?? []) as object,
      related_keywords: (def.related_keywords ?? []) as object,
      faqs: (def.faqs ?? []) as object,
    }

    if (existingDef) {
      await prisma.dictionaryDefinition.update({ where: { wordId: word.id }, data })
    } else {
      await prisma.dictionaryDefinition.create({ data: { wordId: word.id, ...data } })
    }
  }

  if (existingInbound) {
    await prisma.inboundEvent.update({
      where: { id: existingInbound.id },
      data: { payload: envelope as object, event_type: envelope.event ?? 'dictionary.term.upsert', processed: true, processed_at: new Date() },
    })
  } else {
    await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'dictionary.term.upsert',
        payload: envelope as object,
        processed: true,
        processed_at: new Date(),
      },
    })
  }

  return success({ status: 'processed', dictionary_id: dictionary.id, word_id: word.id, event_id: envelope.event_id })
}, { auth: false })
