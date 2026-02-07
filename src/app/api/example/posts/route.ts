/**
 * GET /api/example/posts
 *
 * Returns all published blog posts (synced + fixtures).
 * Query params:
 *   ?limit=10    — max posts to return (default: all)
 *   ?offset=0    — pagination offset
 *   ?source=all  — "synced" | "fixtures" | "all" (default: all)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, getPosts } from '@/app/example/_lib/data'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const full = params.get('full') === 'true'
  const limit = parseInt(params.get('limit') ?? '0', 10) || 0
  const offset = parseInt(params.get('offset') ?? '0', 10) || 0

  const posts = full ? await getAllPosts() : await getPosts()
  const sliced = limit > 0 ? posts.slice(offset, offset + limit) : posts.slice(offset)

  return NextResponse.json({
    posts: sliced,
    total: posts.length,
    offset,
    limit: limit || null,
  })
}
