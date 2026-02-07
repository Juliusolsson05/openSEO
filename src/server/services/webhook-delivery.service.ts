export type WebhookDeliveryInput = {
  endpoint: string
  apiKey?: string | null
  eventType: string
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

  const body = {
    event: input.eventType,
    timestamp: new Date().toISOString(),
    payload: input.payload,
  }

  try {
    const res = await fetch(input.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(input.apiKey ? { Authorization: `Bearer ${input.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
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
