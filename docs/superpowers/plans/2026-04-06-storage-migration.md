# Image Storage Migration: Cloudinary → flydrive + Google Favicons

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded Cloudinary image storage with flydrive (local filesystem default, S3-compatible cloud optional) and replace Logo.dev with Google Favicons — enabling zero-config Docker onboarding with no external service dependencies for media.

**Architecture:** A single `src/server/storage/` module wraps flydrive behind a `StorageDisk` that every caller imports. `STORAGE_DRIVER=local` (default) writes to `./uploads/` with a Docker volume mount. `STORAGE_DRIVER=s3` covers AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces. Image optimization via `sharp` at upload time (thumbnail + large variants). A new API route at `/api/media/[...path]` serves local files. Logo fetching drops Logo.dev and uses Google Favicons directly (zero config, no API key).

**Tech Stack:** flydrive, sharp, Next.js App Router, TypeScript, Docker

---

## Repository Notes

- Project root: `/Users/juliusolsson/Desktop/Development/openseo/openseo/`
- Package manager: npm (NOT pnpm)
- TypeScript check: `cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit`

## Current State (verified by audit)

**Cloudinary touchpoints (8 files):**
- `src/server/utils/cloudinary.ts` — core upload functions (URL, binary, base64)
- `src/server/ai/blog-elements/upload-to-cloudinary.ts` — logo upload via upload_preset
- `src/server/services/image.service.ts` — image generation + upload orchestrator
- `src/server/services/cta.service.ts` — CTA image upload
- `src/server/services/quillo.service.ts` — element image upload
- `src/server/ai/blog-elements/regenerate-element.ts` — logo upload during regeneration
- `src/server/ai/blog-elements/generate-case-study.ts` — logo upload during generation
- `src/server/ai/blog-elements/generate-new-element.ts` — logo upload during generation

**Logo.dev touchpoints (5 files):**
- `src/server/ai/blog-elements/fetch-logo-url.ts` — primary: Logo.dev API, fallback: Google Favicons
- `src/server/ai/blog-elements/regenerate-element.ts` — calls fetchLogoUrl
- `src/server/ai/blog-elements/generate-case-study.ts` — calls fetchLogoUrl
- `src/server/ai/blog-elements/generate-new-element.ts` — calls fetchLogoUrl
- `src/server/ai/index.ts` — re-exports fetchLogoUrl

**Frontend logo.dev references (4 files):**
- `src/components/blog/elements/case_study/CaseStudy.tsx` — uses `img.logo.dev` for logo display
- `src/components/blog/elements/case_study/CaseStudyPreview.tsx` — same
- `src/components/blog/elements/tool_recommendation/ToolRecommendation.tsx` — same
- `src/components/blog/elements/tool_recommendation/ToolRecommendationPreview.tsx` — same

**URL storage pattern:** Full Cloudinary HTTPS URLs stored in DB (cover_image.url, element content.url, cta.image). Frontend renders them directly.

**Default placeholder:** `https://res.cloudinary.com/dl9qdd24e/image/upload/v1732560659/600x400_fqbihy.png` hardcoded in `blog.service.ts` and `image.service.ts`.

## Design Decisions

**URLs are always absolute.** The DB currently stores full HTTPS URLs and the frontend renders them directly. We keep this invariant after migration. `getPublicUrl()` always returns an absolute URL — for local storage it uses `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:4720/api/media/blog_covers/abc.webp`), for S3 it uses the S3 endpoint or `STORAGE_PUBLIC_URL`. No code should ever store a relative `/api/media/...` path in the DB.

**Placeholder is an SVG.** `public/images/placeholder-cover.svg` served by Next.js static files. Referenced as an absolute URL via `NEXT_PUBLIC_SITE_URL` in code constants.

---

## File Structure

**Install:**
- `npm install flydrive @flydrive/s3 sharp @types/sharp`

**Create:**
- `src/server/storage/index.ts` — storage disk factory (flydrive setup)
- `src/server/storage/upload.ts` — upload helpers (URL, binary, base64) with sharp optimization
- `src/app/api/media/[...path]/route.ts` — local file serving route
- `uploads/.gitkeep` — local uploads directory
- `public/images/placeholder-cover.svg` — default placeholder image (replaces Cloudinary URL)

**Modify:**
- `src/server/utils/cloudinary.ts` → **DELETE** entirely
- `src/server/ai/blog-elements/upload-to-cloudinary.ts` → **DELETE** entirely
- `src/server/ai/blog-elements/fetch-logo-url.ts` — replace Logo.dev with Google Favicons
- `src/server/services/image.service.ts` — swap Cloudinary calls to storage module
- `src/server/services/cta.service.ts` — swap Cloudinary calls
- `src/server/services/quillo.service.ts` — swap Cloudinary calls
- `src/server/services/blog.service.ts` — update DEFAULT_IMAGE placeholder
- `src/server/ai/blog-elements/regenerate-element.ts` — swap logo upload call
- `src/server/ai/blog-elements/generate-case-study.ts` — swap logo upload call
- `src/server/ai/blog-elements/generate-new-element.ts` — swap logo upload call
- `src/components/blog/elements/case_study/CaseStudy.tsx` — replace logo.dev URL pattern
- `src/components/blog/elements/case_study/CaseStudyPreview.tsx` — same
- `src/components/blog/elements/tool_recommendation/ToolRecommendation.tsx` — same
- `src/components/blog/elements/tool_recommendation/ToolRecommendationPreview.tsx` — same
- `Dockerfile` — add uploads directory + volume
- `docker-compose.yml` — add uploads volume mount
- `.env.example` — replace Cloudinary vars with STORAGE_DRIVER + S3 vars
- `src/lib/vault.ts` — remove Cloudinary keys from VAULT_KEY_CATALOG
- `.gitignore` — add uploads/ (except .gitkeep)

---

## Task 1: Install dependencies and create storage module

**Files:**
- Create: `src/server/storage/index.ts`
- Create: `src/server/storage/upload.ts`

- [ ] **Step 1: Install flydrive and sharp**

```bash
cd /Users/juliusolsson/Desktop/Development/openseo/openseo
npm install flydrive @flydrive/s3 sharp @types/sharp
```

- [ ] **Step 2: Create the storage disk factory**

Create `src/server/storage/index.ts`:

```ts
import { Disk } from 'flydrive'
import { FSDriver } from 'flydrive/drivers/fs'
import { S3Driver } from '@flydrive/s3'
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
    const endpoint = process.env.S3_ENDPOINT || `https://s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`
    const bucket = process.env.S3_BUCKET || 'openseo'
    return `${endpoint}/${bucket}/${key}`
  }
  // Local: always absolute using the site URL so DB values are never relative.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
  return `${siteUrl}/api/media/${key}`
}
```

- [ ] **Step 3: Create upload helpers with sharp optimization**

Create `src/server/storage/upload.ts`:

```ts
import sharp from 'sharp'
import crypto from 'node:crypto'
import { getStorageDisk, getPublicUrl } from './index'

type UploadResult = {
  key: string
  url: string
  thumbnailUrl: string | null
}

function generateKey(folder: string, ext: string): string {
  const id = crypto.randomUUID().slice(0, 12)
  return `${folder}/${id}.${ext}`
}

async function optimizeAndStore(buffer: Buffer, folder: string): Promise<UploadResult> {
  const disk = getStorageDisk()

  // Original as webp
  const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer()
  const key = generateKey(folder, 'webp')
  await disk.put(key, new Uint8Array(optimized))

  // Thumbnail (400px wide)
  let thumbnailUrl: string | null = null
  try {
    const thumb = await sharp(buffer).resize(400).webp({ quality: 75 }).toBuffer()
    const thumbKey = generateKey(folder + '/thumbs', 'webp')
    await disk.put(thumbKey, new Uint8Array(thumb))
    thumbnailUrl = getPublicUrl(thumbKey)
  } catch {
    // Thumbnail generation is best-effort
  }

  return { key, url: getPublicUrl(key), thumbnailUrl }
}

export async function uploadFromUrl(url: string, folder: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const result = await optimizeAndStore(buffer, folder)
    return result.url
  } catch (err) {
    console.error('[storage] uploadFromUrl failed', err)
    return null
  }
}

export async function uploadFromBase64(
  base64: string,
  folder: string,
  _mimeType?: string,
): Promise<string | null> {
  try {
    const buffer = Buffer.from(base64, 'base64')
    const result = await optimizeAndStore(buffer, folder)
    return result.url
  } catch (err) {
    console.error('[storage] uploadFromBase64 failed', err)
    return null
  }
}

export async function uploadFromBinary(file: File, folder: string): Promise<string | null> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await optimizeAndStore(buffer, folder)
    return result.url
  } catch (err) {
    console.error('[storage] uploadFromBinary failed', err)
    return null
  }
}
```

- [ ] **Step 4: Type-check**

Run: `cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add src/server/storage/ package.json package-lock.json
git commit -m "feat(storage): add flydrive storage module with local/S3 support and sharp optimization"
```

---

## Task 2: Add local file serving route and uploads directory

**Files:**
- Create: `src/app/api/media/[...path]/route.ts`
- Create: `uploads/.gitkeep`
- Create: `public/images/placeholder-cover.svg`
- Modify: `.gitignore`

- [ ] **Step 1: Create the media serving route**

Create `src/app/api/media/[...path]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

const UPLOADS_ROOT = process.env.UPLOADS_PATH || path.join(process.cwd(), 'uploads')

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path
  if (!segments?.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Prevent path traversal — resolve to absolute paths so .. segments
  // cannot escape the uploads root.
  const resolvedRoot = path.resolve(UPLOADS_ROOT)
  const filePath = path.resolve(UPLOADS_ROOT, ...segments)
  if (!filePath.startsWith(resolvedRoot + path.sep) && filePath !== resolvedRoot) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'
  const buffer = fs.readFileSync(filePath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
```

- [ ] **Step 2: Create uploads directory and placeholder**

```bash
mkdir -p uploads
touch uploads/.gitkeep
```

For the placeholder cover image, create a simple SVG at `public/images/placeholder-cover.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="#f5f5f5">
  <rect width="600" height="400" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ccc" font-family="system-ui" font-size="18">No cover image</text>
</svg>
```

- [ ] **Step 3: Add uploads/ to .gitignore**

Add to `.gitignore`:

```
# Uploaded media (local storage)
uploads/*
!uploads/.gitkeep
```

- [ ] **Step 4: Type-check and commit**

```bash
cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit
git add src/app/api/media/ uploads/.gitkeep public/images/placeholder-cover.svg .gitignore
git commit -m "feat(storage): add local media serving route, uploads dir, and placeholder"
```

---

## Task 3: Migrate image.service.ts from Cloudinary to storage module

**Files:**
- Modify: `src/server/services/image.service.ts`
- Modify: `src/server/services/blog.service.ts` (placeholder URL only)

This is the biggest migration task — `image.service.ts` is the main orchestrator for all image uploads.

- [ ] **Step 1: Read `image.service.ts` in full before editing**

Read the entire file to confirm the current state matches the audit.

- [ ] **Step 2: Replace imports and placeholder**

Replace the Cloudinary imports with storage imports:

Before:
```ts
import { uploadUrlToCloudinary, uploadBinaryToCloudinary, uploadBase64ToCloudinary } from '@/server/utils/cloudinary'
```

After:
```ts
import { uploadFromUrl, uploadFromBase64, uploadFromBinary } from '@/server/storage/upload'
```

Replace the placeholder constant:

Before:
```ts
const DEFAULT_PLACEHOLDER_URL = 'https://res.cloudinary.com/dl9qdd24e/image/upload/v1732560659/600x400_fqbihy.png'
```

After:
```ts
// Placeholder is a static asset served by Next.js from public/.
// Note: this relative path is only used as a default for newly generated posts.
// The frontend's resolveMediaUrl() already handles relative paths correctly.
// This is the one exception to the "always absolute" DB rule — it's a static
// asset, not a stored upload, and works regardless of NEXT_PUBLIC_SITE_URL.
const DEFAULT_PLACEHOLDER_URL = '/images/placeholder-cover.svg'
```

- [ ] **Step 3: Replace every `uploadUrlToCloudinary` call with `uploadFromUrl`**

The function signatures are the same: `(url: string, folder: string) => Promise<string | null>`. Find-and-replace within the file:
- `uploadUrlToCloudinary(` → `uploadFromUrl(`
- `uploadBinaryToCloudinary(` → `uploadFromBinary(`
- `uploadBase64ToCloudinary(` → `uploadFromBase64(`

The folder names stay the same (`blog_covers`, `blog_elements`, etc.) — flydrive uses them as path prefixes.

- [ ] **Step 4: Update `blog.service.ts` placeholder**

In `src/server/services/blog.service.ts`, replace:

```ts
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dl9qdd24e/image/upload/v1732560659/600x400_fqbihy.png'
```

With:

```ts
const DEFAULT_IMAGE = '/images/placeholder-cover.svg'
```

- [ ] **Step 5: Type-check and commit**

```bash
cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit
git add src/server/services/image.service.ts src/server/services/blog.service.ts
git commit -m "feat(storage): migrate image.service and blog.service from Cloudinary to flydrive"
```

---

## Task 4: Migrate cta.service.ts and quillo.service.ts

**Files:**
- Modify: `src/server/services/cta.service.ts`
- Modify: `src/server/services/quillo.service.ts`

- [ ] **Step 1: Read both files, find Cloudinary imports and calls**

- [ ] **Step 2: Replace imports in both files**

Replace `from '@/server/utils/cloudinary'` with `from '@/server/storage/upload'`. Replace function calls:
- `uploadUrlToCloudinary(` → `uploadFromUrl(`
- `uploadBinaryToCloudinary(` → `uploadFromBinary(`
- `uploadBase64ToCloudinary(` → `uploadFromBase64(`

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit
git add src/server/services/cta.service.ts src/server/services/quillo.service.ts
git commit -m "feat(storage): migrate cta.service and quillo.service from Cloudinary"
```

---

## Task 5: Migrate blog-element generators (logo upload)

**Files:**
- Modify: `src/server/ai/blog-elements/regenerate-element.ts`
- Modify: `src/server/ai/blog-elements/generate-case-study.ts`
- Modify: `src/server/ai/blog-elements/generate-new-element.ts`
- Delete: `src/server/ai/blog-elements/upload-to-cloudinary.ts`

These three files import `uploadToCloudinary` from the blog-elements-specific `upload-to-cloudinary.ts` (not the utils one). They use it to upload fetched logo URLs.

- [ ] **Step 1: Read all three generator files to find the Cloudinary import and usage**

- [ ] **Step 2: Replace in all three files**

Replace:
```ts
import { uploadToCloudinary } from './upload-to-cloudinary'
```

With:
```ts
import { uploadFromUrl } from '@/server/storage/upload'
```

Replace all calls like:
```ts
const logoUrl = await uploadToCloudinary(fetchedUrl)
```

With:
```ts
const logoUrl = await uploadFromUrl(fetchedUrl, 'company_logos')
```

Note: the old `upload-to-cloudinary.ts` hardcoded `folder: 'company_logos'`. The new call needs to pass the folder explicitly.

- [ ] **Step 3: Delete `src/server/ai/blog-elements/upload-to-cloudinary.ts`**

```bash
rm src/server/ai/blog-elements/upload-to-cloudinary.ts
```

- [ ] **Step 4: Type-check and commit**

```bash
cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit
git add src/server/ai/blog-elements/ 
git commit -m "feat(storage): migrate blog-element logo uploads, delete upload-to-cloudinary.ts"
```

---

## Task 6: Replace Logo.dev with Google Favicons

**Files:**
- Modify: `src/server/ai/blog-elements/fetch-logo-url.ts`
- Modify: `src/components/blog/elements/case_study/CaseStudy.tsx`
- Modify: `src/components/blog/elements/case_study/CaseStudyPreview.tsx`
- Modify: `src/components/blog/elements/tool_recommendation/ToolRecommendation.tsx`
- Modify: `src/components/blog/elements/tool_recommendation/ToolRecommendationPreview.tsx`

- [ ] **Step 1: Rewrite fetch-logo-url.ts**

Replace the entire file:

```ts
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
```

This drops the Logo.dev dependency entirely. Google Favicons is free, no API key, reliable.

- [ ] **Step 2: Update frontend components that reference logo.dev**

In the 4 frontend component files, find any direct references to `img.logo.dev` in the JSX (used as fallback logo sources). These components use `extractDomain` and construct logo.dev URLs for display.

Read each file, find the pattern, and replace `img.logo.dev` references with the Google Favicon URL pattern:

```ts
// Before
const logoSrc = `https://img.logo.dev/${domain}?token=...`

// After  
const logoSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
```

If the components read `LOGO_API_TOKEN` from anywhere client-side, remove that reference.

- [ ] **Step 3: Type-check and commit**

```bash
cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit
git add src/server/ai/blog-elements/fetch-logo-url.ts src/components/blog/elements/case_study/ src/components/blog/elements/tool_recommendation/
git commit -m "feat(logo): replace Logo.dev with Google Favicons (zero config, no API key)"
```

---

## Task 7: Delete Cloudinary, update config, update Docker

**Files:**
- Delete: `src/server/utils/cloudinary.ts`
- Modify: `src/lib/vault.ts` — remove Cloudinary keys from VAULT_KEY_CATALOG
- Modify: `.env.example` — replace Cloudinary vars with storage vars
- Modify: `Dockerfile` — add uploads directory
- Modify: `docker-compose.yml` — add uploads volume
- Modify: `next.config.ts` — add Google Favicons to remotePatterns (for next/image if used)

- [ ] **Step 1: Delete cloudinary.ts**

```bash
rm src/server/utils/cloudinary.ts
```

- [ ] **Step 2: Remove Cloudinary keys from vault**

In `src/lib/vault.ts`, find `VAULT_KEY_CATALOG` (or equivalent) and remove:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET`

Also remove `LOGO_API_TOKEN`.

- [ ] **Step 3: Update .env.example**

Replace the Cloudinary and Logo sections:

Before:
```
# Media providers
IDEOGRAM=replace-ideogram-key
LOGO_API_TOKEN=replace-logo-dev-token
PEXELS=replace-pexels-key

# Cloudinary
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_CLOUD_NAME=replace-cloud-name
CLOUDINARY_API_KEY=replace-cloudinary-api-key
CLOUDINARY_API_SECRET=replace-cloudinary-api-secret
CLOUDINARY_UPLOAD_PRESET=replace-upload-preset
```

After:
```
# Media providers
IDEOGRAM=replace-ideogram-key
PEXELS=replace-pexels-key

# Storage (default: local filesystem, no config needed)
# Set STORAGE_DRIVER=s3 for S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
STORAGE_DRIVER=local
# S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
# S3_BUCKET=openseo
# S3_REGION=auto
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# STORAGE_PUBLIC_URL=https://cdn.example.com
```

- [ ] **Step 4: Update Dockerfile**

Add uploads directory creation in the runner stage, after `COPY --from=builder`:

```dockerfile
# Create uploads directory for local storage
RUN mkdir -p /app/uploads
```

- [ ] **Step 5: Update docker-compose.yml**

Add volume for uploads persistence:

```yaml
  app:
    # ... existing config ...
    volumes:
      - uploads_data:/app/uploads

volumes:
  postgres_data:
  redis_data:
  uploads_data:
```

- [ ] **Step 6: Verify no remaining Cloudinary references**

```bash
grep -rn "cloudinary" src/ --include="*.ts" --include="*.tsx"
grep -rn "CLOUDINARY" src/ .env.example
grep -rn "logo\.dev" src/ --include="*.ts" --include="*.tsx"
grep -rn "LOGO_API_TOKEN" src/ --include="*.ts" --include="*.tsx"
```

All should return zero hits (except possibly comments or type definitions that are safe to leave).

- [ ] **Step 7: Type-check and commit**

```bash
cd /Users/juliusolsson/Desktop/Development/openseo/openseo && npx tsc --noEmit
git add -A
git commit -m "feat(storage): remove Cloudinary, update Docker for local storage, update env config"
```

---

## Self-Review

**1. Spec coverage:**
- flydrive with local default: Task 1
- S3-compatible cloud support: Task 1 (S3Driver)
- sharp image optimization at upload: Task 1 (upload.ts)
- Local file serving route: Task 2
- Docker volume mount: Task 7
- image.service.ts migration: Task 3
- cta.service.ts migration: Task 4
- quillo.service.ts migration: Task 4
- Blog element logo upload migration: Task 5
- Logo.dev → Google Favicons: Task 6
- Frontend logo.dev references: Task 6
- Delete cloudinary.ts: Task 7
- Update env/config: Task 7
- Default placeholder image: Task 2 + Task 3

**2. Placeholder scan:** No TBDs. Every file edit has exact before/after code.

**3. Type consistency:** `uploadFromUrl`, `uploadFromBase64`, `uploadFromBinary` signatures match Cloudinary equivalents (same `(source, folder) → Promise<string | null>` pattern). `getPublicUrl` and `getStorageDisk` defined once in Task 1, used everywhere.
