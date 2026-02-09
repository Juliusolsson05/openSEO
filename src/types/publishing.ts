/**
 * Publishing inbound types — shared across all v1 publishing inbound routes.
 */

/** Base envelope shape for all inbound publishing events. */
export interface InboundEnvelopeBase {
  contract_version?: string
  event?: string
  event_id?: string
  payload?: Record<string, unknown>
}

/** Extract inbound API key from Authorization header or x-aurora-inbound-key. */
export function readInboundKey(headers: Headers): string {
  const auth = headers.get('authorization') ?? ''
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
  return headers.get('x-aurora-inbound-key')?.trim() ?? ''
}
