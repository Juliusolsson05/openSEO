import sharp from 'sharp'
import crypto from 'node:crypto'
import { getStorageDisk, getPublicUrl } from './index'

type UploadResult = {
  key: string
  url: string
  thumbnailUrl: string | null
}

/**
 * Storage layout:
 *   {companyId}/{folder}/{id}.webp
 *   {companyId}/{folder}/{id}.thumb.webp
 *
 * Examples:
 *   42/covers/a1b2c3d4e5f6.webp
 *   42/covers/a1b2c3d4e5f6.thumb.webp
 *   42/elements/b2c3d4e5f6a1.webp
 *   42/logos/c3d4e5f6a1b2.webp
 */
function generateKey(companyId: number, folder: string, ext: string): string {
  const id = crypto.randomUUID().slice(0, 12)
  return `${companyId}/${folder}/${id}.${ext}`
}

function thumbKey(originalKey: string): string {
  return originalKey.replace('.webp', '.thumb.webp')
}

async function optimizeAndStore(buffer: Buffer, companyId: number, folder: string): Promise<UploadResult> {
  const disk = getStorageDisk()

  const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer()
  const key = generateKey(companyId, folder, 'webp')
  await disk.put(key, new Uint8Array(optimized))

  let thumbnailUrl: string | null = null
  try {
    const thumb = await sharp(buffer).resize(400).webp({ quality: 75 }).toBuffer()
    const tKey = thumbKey(key)
    await disk.put(tKey, new Uint8Array(thumb))
    thumbnailUrl = getPublicUrl(tKey)
  } catch {
    // Thumbnail generation is best-effort
  }

  return { key, url: getPublicUrl(key), thumbnailUrl }
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const hostname = parsed.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) return false
    if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return false
    return true
  } catch {
    return false
  }
}

export async function uploadFromUrl(url: string, companyId: number, folder: string): Promise<string | null> {
  try {
    if (!isSafeUrl(url)) {
      console.error('[storage] uploadFromUrl blocked — URL targets a private/local address', url)
      return null
    }
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const result = await optimizeAndStore(buffer, companyId, folder)
    return result.url
  } catch (err) {
    console.error('[storage] uploadFromUrl failed', err)
    return null
  }
}

export async function uploadFromBase64(
  base64: string,
  companyId: number,
  folder: string,
  _mimeType?: string,
): Promise<string | null> {
  try {
    const buffer = Buffer.from(base64, 'base64')
    const result = await optimizeAndStore(buffer, companyId, folder)
    return result.url
  } catch (err) {
    console.error('[storage] uploadFromBase64 failed', err)
    return null
  }
}

export async function uploadFromBinary(file: File, companyId: number, folder: string): Promise<string | null> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await optimizeAndStore(buffer, companyId, folder)
    return result.url
  } catch (err) {
    console.error('[storage] uploadFromBinary failed', err)
    return null
  }
}
