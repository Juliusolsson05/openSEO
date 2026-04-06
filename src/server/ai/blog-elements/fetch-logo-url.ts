export async function fetchLogoUrl(companyWebsite: string): Promise<string | null> {
  try {
    const domain = companyWebsite
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .split('/')[0]

    if (!domain) return null

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    const res = await fetch(faviconUrl, { redirect: 'follow' })
    if (res.ok) return faviconUrl

    return null
  } catch {
    return null
  }
}
