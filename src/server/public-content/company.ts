/** Resolve tenant company id: explicit arg → PUBLIC_CONTENT_COMPANY_ID env → null. */
export function resolvePublicCompanyId(explicit?: number | string | null): number | null {
  if (explicit != null && explicit !== '') {
    const n = typeof explicit === 'number' ? explicit : parseInt(explicit, 10)
    if (Number.isInteger(n) && n > 0) return n
  }

  const envRaw = process.env.PUBLIC_CONTENT_COMPANY_ID
  if (envRaw != null && envRaw !== '') {
    const n = parseInt(envRaw, 10)
    if (Number.isInteger(n) && n > 0) return n
  }

  return null
}
