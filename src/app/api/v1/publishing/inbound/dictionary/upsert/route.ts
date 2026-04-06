import { Prisma } from '@prisma/client'
import { readInboundKey, type InboundEnvelope, type InboundDictionaryPayload } from '@/types/publishing'
import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { AppError, ValidationError } from '@/server/api/errors'
import { raw, success } from '@/server/api/response'
import { resolveCompanyByInboundApiKey } from '@/server/publishing/auth'


export const POST = apiHandler(async ({ body }, req) => {
  const inboundKey = readInboundKey(req.headers)
  if (!inboundKey) return raw({ detail: 'Missing inbound API key' }, 401)

  const companyId = await resolveCompanyByInboundApiKey(inboundKey)
  if (!companyId) return raw({ detail: 'Invalid inbound API key' }, 401)

  const envelope = (body ?? {}) as InboundEnvelope<InboundDictionaryPayload>
  if (!envelope.event_id) throw new ValidationError('event_id is required')

  let inboundRow
  try {
    inboundRow = await prisma.inboundEvent.create({
      data: {
        companyId,
        event_id: envelope.event_id,
        event_type: envelope.event ?? 'dictionary.upsert',
        payload: envelope as object,
        processed: false,
      },
      select: { id: true },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return success({ status: 'duplicate_ignored', event_id: envelope.event_id, idempotent: true })
    }
    throw err
  }

  let result
  try {
    const dictionaryPayload = envelope.payload?.dictionary
    if (!dictionaryPayload) throw new ValidationError('payload.dictionary is required')

    let dictionary = null as Awaited<ReturnType<typeof prisma.dictionary.findFirst>>

    if (dictionaryPayload.id) {
      dictionary = await prisma.dictionary.findFirst({ where: { id: dictionaryPayload.id, companyId } })
    }

    if (!dictionary && dictionaryPayload.title) {
      dictionary = await prisma.dictionary.findFirst({ where: { title: dictionaryPayload.title, companyId } })
    }

    if (!dictionary) {
      if (!dictionaryPayload.title || !dictionaryPayload.subject || !dictionaryPayload.language) {
        throw new ValidationError('For create, dictionary title/subject/language are required')
      }

      dictionary = await prisma.dictionary.create({
        data: {
          companyId,
          title: dictionaryPayload.title,
          subject: dictionaryPayload.subject,
          language: dictionaryPayload.language,
          num_words: dictionaryPayload.num_words ?? 0,
          current_letter: dictionaryPayload.current_letter ?? 'a',
          status: dictionaryPayload.status ?? 'IN_PROGRESS',
        },
      })
    } else {
      dictionary = await prisma.dictionary.update({
        where: { id: dictionary.id },
        data: {
          ...(dictionaryPayload.title !== undefined ? { title: dictionaryPayload.title } : {}),
          ...(dictionaryPayload.subject !== undefined ? { subject: dictionaryPayload.subject } : {}),
          ...(dictionaryPayload.language !== undefined ? { language: dictionaryPayload.language } : {}),
          ...(dictionaryPayload.num_words !== undefined ? { num_words: dictionaryPayload.num_words } : {}),
          ...(dictionaryPayload.current_letter !== undefined ? { current_letter: dictionaryPayload.current_letter } : {}),
          ...(dictionaryPayload.status !== undefined ? { status: dictionaryPayload.status } : {}),
        },
      })
    }

    await prisma.inboundEvent.update({
      where: { id: inboundRow.id },
      data: { processed: true, processed_at: new Date() },
    })

    result = success({ status: 'processed', dictionary_id: dictionary.id, event_id: envelope.event_id })
  } catch (err) {
    if (!(err instanceof AppError)) {
      await prisma.inboundEvent.delete({ where: { id: inboundRow.id } }).catch(() => {})
    }
    throw err
  }

  return result
}, { auth: false })
