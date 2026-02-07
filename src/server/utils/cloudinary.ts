function getCloudinaryCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return null
  return { cloudName, apiKey, apiSecret }
}

export async function generateCloudinarySignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort()
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret
  const data = new TextEncoder().encode(toSign)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function uploadToCloudinary(
  source: File | string | { base64: string; mimeType: string },
  folder: string,
): Promise<string | null> {
  const creds = getCloudinaryCredentials()
  if (!creds) {
    console.error('[Cloudinary] Missing credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)')
    return null
  }

  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = await generateCloudinarySignature({ folder, timestamp }, creds.apiSecret)
  const endpoint = `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`

  let res: Response
  if (source instanceof File) {
    const form = new FormData()
    form.set('file', source)
    form.set('folder', folder)
    form.set('timestamp', timestamp)
    form.set('api_key', creds.apiKey)
    form.set('signature', signature)
    res = await fetch(endpoint, { method: 'POST', body: form })
  } else {
    const fileValue =
      typeof source === 'string' ? source : `data:${source.mimeType ?? 'image/png'};base64,${source.base64}`

    const body = new URLSearchParams({
      file: fileValue,
      folder,
      timestamp,
      api_key: creds.apiKey,
      signature,
    })
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    console.error(`[Cloudinary] Upload failed: ${res.status} ${errBody}`)
    return null
  }

  const data = (await res.json()) as { secure_url?: string }
  return data.secure_url ?? null
}

export async function uploadUrlToCloudinary(url: string, folder: string) {
  return uploadToCloudinary(url, folder)
}

export async function uploadBinaryToCloudinary(file: File, folder: string) {
  return uploadToCloudinary(file, folder)
}

export async function uploadBase64ToCloudinary(
  base64: string,
  folder: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
) {
  return uploadToCloudinary({ base64, mimeType }, folder)
}
