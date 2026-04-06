/**
 * Canonical outbound webhook envelope.
 *
 * This is the ONLY place where outbound payloads get wrapped. Upstream
 * services MUST pass the raw, event-specific payload (e.g. `{ post, processed_content }`
 * for `post.upsert`) and let `sendJsonWebhook` attach envelope metadata.
 *
 * Wire shape:
 *   {
 *     contract_version: "2026-02-1",
 *     event: "post.upsert",
 *     event_id: "evt_<uuid>",
 *     sent_at: "<ISO8601>",
 *     payload: <raw event payload>
 *   }
 */
export type WebhookEnvelope<T = unknown> = {
  contract_version: string
  event: string
  event_id: string
  sent_at: string
  payload: T
}

export const OUTBOUND_CONTRACT_VERSION = '2026-02-1'

export type WebhookDeliveryInput = {
  endpoint: string
  apiKey?: string | null
  eventType: string
  /**
   * The raw event-specific payload. Do NOT pre-wrap this in an envelope —
   * `sendJsonWebhook` will attach `contract_version`, `event`, `event_id`,
   * and `sent_at` automatically.
   */
  payload: unknown
  timeoutMs?: number
}

export type WebhookDeliveryResult = {
  ok: boolean
  status: number
  deliveryId: string
  response: unknown
}

function pickDeliveryId(response: unknown) {
  if (!response || typeof response !== 'object') return null
  const obj = response as Record<string, unknown>
  const candidate = obj.delivery_id ?? obj.remote_id ?? obj.id ?? obj.wp_post_id
  return candidate ? String(candidate) : null
}

export async function sendJsonWebhook(input: WebhookDeliveryInput): Promise<WebhookDeliveryResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 15000)

  const envelope: WebhookEnvelope = {
    contract_version: OUTBOUND_CONTRACT_VERSION,
    event: input.eventType,
    event_id: `evt_${crypto.randomUUID()}`,
    sent_at: new Date().toISOString(),
    payload: input.payload,
  }

  try {
    const res = await fetch(input.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(input.apiKey ? { Authorization: `Bearer ${input.apiKey}` } : {}),
      },
      body: JSON.stringify(envelope),
      signal: controller.signal,
    })

    const contentType = res.headers.get('content-type') ?? ''
    const responseBody = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => '')

    const deliveryId = pickDeliveryId(responseBody) ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    return {
      ok: res.ok,
      status: res.status,
      deliveryId,
      response: responseBody,
    }
  } finally {
    clearTimeout(timeout)
  }
}
