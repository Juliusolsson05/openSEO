import { readInboundKey, type InboundEnvelope, type InboundTermDeletePayload } from '@/types/publishing'
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

  const envelope = (body ?? {}) as InboundEnvelope<InboundTermDeletePayload>
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
  if (!dictionaryPayload || !termPayload) throw new ValidationError('payload.dictionary and payload.term are required')

  let dictionaryId: number | null = null

  if (dictionaryPayload.id) {
    const dictionary = await prisma.dictionary.findFirst({ where: { id: dictionaryPayload.id, companyId }, select: { id: true } })
    dictionaryId = dictionary?.id ?? null
  }

  if (!dictionaryId && dictionaryPayload.title) {
    const dictionary = await prisma.dictionary.findFirst({ where: { title: dictionaryPayload.title, companyId }, select: { id: true } })
    dictionaryId = dictionary?.id ?? null
  }

  if (!dictionaryId) throw new ValidationError('Dictionary not found')

  let termId: number | null = null

  if (termPayload.id) {
    const term = await prisma.word.findFirst({ where: { id: termPayload.id, dictionaryId }, select: { id: true } })
    termId = term?.id ?? null
  }

  if (!termId && termPayload.keyword) {
    const term = await prisma.word.findFirst({ where: { dictionaryId, keyword: termPayload.keyword }, select: { id: true } })
    termId = term?.id ?? null
  }

  if (!termId) throw new ValidationError('Term not found for delete')

  await prisma.word.delete({ where: { id: termId } })

  if (existingInbound) {
    await prisma.inboundEvent.update({
      where: { id: existingInbound.id },
      data: {
        payload: envelope as object,
        event_type: envelope.event ?? 'dictionary.term.delete',
        processed: true,
        processed_at: new Date(),
      },
    })
  } else {
    await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'dictionary.term.delete',
        payload: envelope as object,
        processed: true,
        processed_at: new Date(),
      },
    })
  }

  return success({ status: 'processed', deleted_term_id: termId, event_id: envelope.event_id })
}, { auth: false })
