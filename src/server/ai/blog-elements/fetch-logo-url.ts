export async function fetchLogoUrl(companyWebsite: string): Promise<string | null> {
  try {
    const domain = companyWebsite
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .split('/')[0];

    const logoApiToken = process.env.LOGO_API_TOKEN;
    if (!logoApiToken) throw new Error('LOGO_API_TOKEN not found in environment variables');

    const logoUrl = `https://img.logo.dev/${domain}?token=${logoApiToken}`;
    const logoResponse = await fetch(logoUrl, { redirect: 'follow' });
    if (logoResponse.ok) return logoUrl;

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const faviconResponse = await fetch(faviconUrl, { redirect: 'follow' });
    if (faviconResponse.ok) return faviconUrl;

    return null;
  } catch {
    return null;
  }
}
