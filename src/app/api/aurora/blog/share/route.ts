import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  const body = await req.json().catch(() => ({}))
  const postId = Number(body?.post_id)

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ detail: 'post_id must be a positive integer' }, { status: 400 })
  }

  const token = crypto.randomUUID()

  const link = await prisma.shareLink.upsert({
    where: { postId },
    update: {
      token,
      enabled: true,
      expiresAt: null,
    },
    create: {
      postId,
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

  const body = await req.json().catch(() => ({}))
  const postId = Number(body?.post_id)

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ detail: 'post_id must be a positive integer' }, { status: 400 })
  }

  await prisma.shareLink.upsert({
    where: { postId },
    update: {
      enabled: false,
      token: crypto.randomUUID(),
      expiresAt: null,
    },
    create: {
      postId,
      enabled: false,
      token: crypto.randomUUID(),
    },
  })

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session?.user) {
    return NextResponse.json({ detail: 'Authentication required' }, { status: 401 })
  }

  const postId = Number(req.nextUrl.searchParams.get('post_id'))

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ detail: 'post_id must be a positive integer' }, { status: 400 })
  }

  const link = await prisma.shareLink.findUnique({ where: { postId } })

  if (!link) {
    return NextResponse.json({
      share_enabled: false,
      share_token: null,
      share_url: null,
      share_expires_at: null,
    })
  }

  return NextResponse.json({
    share_enabled: link.enabled,
    share_token: link.token,
    share_url: link.enabled ? buildShareUrl(req, link.token) : null,
    share_expires_at: link.expiresAt,
  })
}
