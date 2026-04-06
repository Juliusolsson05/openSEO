import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateShareToken } from '@/server/lib/share-token'

function buildShareUrl(req: NextRequest, token: string) {
  const base = process.env.FRONTEND_URL || req.nextUrl.origin
  return `${base}/share/blog/${token}`
}

async function requireSession() {
  const session = await auth()
  if (!session?.user) return null
  return session
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  if (!session?.user) {
    return NextResponse.json({ detail: 'Authentication required' }, { status: 401 })
  }

  const companyId = session.user.companyId
  if (!companyId) {
    return NextResponse.json({ detail: 'No company context' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const postId = Number(body?.post_id)

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ detail: 'post_id must be a positive integer' }, { status: 400 })
  }

  // Ownership check — the post must belong to the session's company.
  const owned = await prisma.blogPost.findFirst({
    where: { id: postId, companyId },
    select: { id: true },
  })
  if (!owned) {
    return NextResponse.json({ detail: 'Blog post not found' }, { status: 404 })
  }

  const token = generateShareToken()
  const createdByUserId = session.user.id ?? null

  const link = await prisma.shareLink.upsert({
    where: { postId },
    update: {
      token,
      enabled: true,
      expiresAt: null,
      revokedAt: null,
      companyId,
      createdByUserId,
    },
    create: {
      postId,
      companyId,
      createdByUserId,
      token,
      enabled: true,
    },
  })

  return NextResponse.json({
    share_token: link.token,
    share_url: buildShareUrl(req, link.token),
  })
}

export async function DELETE(req: NextRequest) {
  const session = await requireSession()
  if (!session?.user) {
    return NextResponse.json({ detail: 'Authentication required' }, { status: 401 })
  }

  const companyId = session.user.companyId
  if (!companyId) {
    return NextResponse.json({ detail: 'No company context' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const postId = Number(body?.post_id)

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ detail: 'post_id must be a positive integer' }, { status: 400 })
  }

  // Only revoke links belonging to the caller's company.
  const existing = await prisma.shareLink.findUnique({ where: { postId } })
  if (!existing || existing.companyId !== companyId) {
    // Treat as success (idempotent) but do nothing.
    return NextResponse.json({ success: true })
  }

  // Soft revoke: keep row for audit, disable lookup, rotate token so the
  // old URL cannot be reused even if the row were ever re-enabled.
  await prisma.shareLink.update({
    where: { postId },
    data: {
      enabled: false,
      revokedAt: new Date(),
      token: generateShareToken(),
      expiresAt: null,
    },
  })

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session?.user) {
    return NextResponse.json({ detail: 'Authentication required' }, { status: 401 })
  }

  const companyId = session.user.companyId
  if (!companyId) {
    return NextResponse.json({ detail: 'No company context' }, { status: 403 })
  }

  const postId = Number(req.nextUrl.searchParams.get('post_id'))

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ detail: 'post_id must be a positive integer' }, { status: 400 })
  }

  const belongs = await prisma.blogPost.findFirst({
    where: { id: postId, companyId },
    select: { id: true },
  })
  if (!belongs) {
    return NextResponse.json({ detail: 'Post not found' }, { status: 404 })
  }

  const link = await prisma.shareLink.findUnique({ where: { postId } })

  const inactive =
    !link ||
    link.companyId !== companyId ||
    !link.enabled ||
    link.revokedAt !== null ||
    (link.expiresAt !== null && link.expiresAt.getTime() < Date.now())

  if (inactive) {
    return NextResponse.json({
      share_enabled: false,
      share_token: null,
      share_url: null,
      share_expires_at: null,
    })
  }

  return NextResponse.json({
    share_enabled: link!.enabled,
    share_token: link!.token,
    share_url: buildShareUrl(req, link!.token),
    share_expires_at: link!.expiresAt,
  })
}
