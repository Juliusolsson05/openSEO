export function createRequestId(): string {
  try {
    return `req_${crypto.randomUUID().replace(/-/g, '')}`
  } catch {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  }
}
