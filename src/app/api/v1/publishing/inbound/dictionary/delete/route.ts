import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { raw, success } from '@/server/api/response'
import { resolveCompanyByInboundApiKey } from '@/server/publishing/auth'

type InboundEnvelope = {
  event?: string
  event_id?: string
  payload?: {
    dictionary?: {
      id?: number
      title?: string
    }
  }
}

function readInboundKey(headers: Headers) {
  const auth = headers.get('authorization') ?? ''
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
  return headers.get('x-aurora-inbound-key')?.trim() ?? ''
}

export const POST = apiHandler(async ({ body }, req) => {
  const inboundKey = readInboundKey(req.headers)
  if (!inboundKey) return raw({ detail: 'Missing inbound API key' }, 401)

  const companyId = await resolveCompanyByInboundApiKey(inboundKey)
  if (!companyId) return raw({ detail: 'Invalid inbound API key' }, 401)

  const envelope = (body ?? {}) as InboundEnvelope
  if (!envelope.event_id) throw new ValidationError('event_id is required')

  const existingInbound = await prisma.inboundEvent.findFirst({
    where: { companyId, event_id: envelope.event_id },
    select: { id: true, processed: true },
  })

  if (existingInbound?.processed) {
    return success({ status: 'duplicate_ignored', event_id: envelope.event_id })
  }

  const dictionaryPayload = envelope.payload?.dictionary
  if (!dictionaryPayload) throw new ValidationError('payload.dictionary is required')

  let dictionaryId: number | null = null

  if (dictionaryPayload.id) {
    const dictionary = await prisma.dictionary.findFirst({ where: { id: dictionaryPayload.id, companyId }, select: { id: true } })
    dictionaryId = dictionary?.id ?? null
  }

  if (!dictionaryId && dictionaryPayload.title) {
    const dictionary = await prisma.dictionary.findFirst({ where: { title: dictionaryPayload.title, companyId }, select: { id: true } })
    dictionaryId = dictionary?.id ?? null
  }

  if (!dictionaryId) throw new ValidationError('Dictionary not found for delete')

  await prisma.dictionary.delete({ where: { id: dictionaryId } })

  if (existingInbound) {
    await prisma.inboundEvent.update({
      where: { id: existingInbound.id },
      data: {
        payload: envelope as object,
        event_type: envelope.event ?? 'dictionary.delete',
        processed: true,
        processed_at: new Date(),
      },
    })
  } else {
    await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'dictionary.delete',
        payload: envelope as object,
        processed: true,
        processed_at: new Date(),
      },
    })
  }

  return success({ status: 'processed', deleted_dictionary_id: dictionaryId, event_id: envelope.event_id })
}, { auth: false })
