/** Resolve tenant company id: explicit arg → PUBLIC_CONTENT_COMPANY_ID env → throw. */
export function resolvePublicCompanyId(explicit?: number | string | null): number {
  if (explicit != null && explicit !== '') {
    const n = typeof explicit === 'number' ? explicit : parseInt(explicit, 10)
    if (Number.isInteger(n) && n > 0) return n
  }

  const envRaw = process.env.PUBLIC_CONTENT_COMPANY_ID
  if (envRaw != null && envRaw !== '') {
    const n = parseInt(envRaw, 10)
    if (Number.isInteger(n) && n > 0) return n
  }

  throw new Error(
    'resolvePublicCompanyId: no company id available. ' +
      'Pass an explicit id from request context or set PUBLIC_CONTENT_COMPANY_ID.',
  )
}
