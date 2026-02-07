/**
 * GET /api/example/posts/:slug
 *
 * Returns a single blog post by slug, including all elements.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPost } from '@/app/example/_lib/data'

type RouteParams = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ post })
}
