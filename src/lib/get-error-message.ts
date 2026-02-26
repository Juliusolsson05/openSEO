/**
 * Safely extract a human-readable message from an unknown error.
 * Use in React Query onError handlers and catch blocks instead of (err: any).
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message || fallback
  if (typeof err === 'string') return err || fallback
  if (err !== null && typeof err === 'object' && 'message' in err) {
    const msg = (err as Record<string, unknown>).message
    if (typeof msg === 'string') return msg || fallback
  }
  return fallback
}
