import { Disk } from 'flydrive'
import { FSDriver } from 'flydrive/drivers/fs'
import { S3Driver } from 'flydrive/drivers/s3'
import path from 'node:path'

let _disk: Disk | null = null

export function getStorageDisk(): Disk {
  if (_disk) return _disk

  const driver = process.env.STORAGE_DRIVER || 'local'

  if (driver === 's3') {
    _disk = new Disk(
      new S3Driver({
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION || 'auto',
        bucket: process.env.S3_BUCKET || 'openseo',
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: true,
        visibility: 'public',
      }),
    )
  } else {
    const uploadsRoot = process.env.UPLOADS_PATH || path.join(process.cwd(), 'uploads')
    _disk = new Disk(new FSDriver({ location: uploadsRoot, visibility: 'public' }))
  }

  return _disk
}

/**
 * Returns an absolute URL for a stored file. URLs stored in the DB must
 * always be absolute so the frontend, webhooks, and external consumers
 * can use them directly without knowing the storage driver.
 */
export function getPublicUrl(key: string): string {
  const driver = process.env.STORAGE_DRIVER || 'local'
  if (driver === 's3') {
    const publicUrl = process.env.STORAGE_PUBLIC_URL
    if (publicUrl) return `${publicUrl.replace(/\/+$/, '')}/${key}`
    const endpoint =
      process.env.S3_ENDPOINT || `https://s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`
    const bucket = process.env.S3_BUCKET || 'openseo'
    return `${endpoint}/${bucket}/${key}`
  }
  // Local: always absolute using the site URL so DB values are never relative.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || '4720'}`).replace(/\/+$/, '')
  return `${siteUrl}/api/media/${key}`
}
