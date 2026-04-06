/**
 * GET /api/example/posts
 *
 * Returns all published blog posts (synced + fixtures).
 * Query params:
 *   ?limit=10    — max posts to return (default: all)
 *   ?offset=0    — pagination offset
 *   ?source=all  — "synced" | "fixtures" | "all" (default: all)
 *   ?full=true   — return full post objects with elements (default: slim)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts } from '@/app/example/_lib/data'
import { getSyncedPosts } from '@/app/example/_lib/store'
import { EXAMPLE_POSTS } from '@/app/example/_lib/fixtures'
import type { ExamplePost } from '@/app/example/_lib/types'

function getCompanyId(): number {
  return parseInt(process.env.EXAMPLE_COMPANY_ID ?? '1', 10)
}

function slim(post: ExamplePost) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image_url: post.cover_image_url,
    cover_image_alt: post.cover_image_alt,
    published_at: post.published_at,
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const full = params.get('full') === 'true'
  const limit = parseInt(params.get('limit') ?? '0', 10) || 0
  const offset = parseInt(params.get('offset') ?? '0', 10) || 0
  const sourceParam = (params.get('source') ?? 'all').toLowerCase()

  let posts: ExamplePost[]
  switch (sourceParam) {
    case 'synced':
      posts = await getSyncedPosts(getCompanyId())
      break
    case 'fixtures':
      posts = [...EXAMPLE_POSTS]
      break
    case 'all':
    default:
      posts = await getAllPosts()
      break
  }

  const shaped = full ? posts : posts.map(slim)
  const sliced = limit > 0 ? shaped.slice(offset, offset + limit) : shaped.slice(offset)

  return NextResponse.json({
    posts: sliced,
    total: posts.length,
    offset,
    limit: limit || null,
    source: sourceParam === 'synced' || sourceParam === 'fixtures' ? sourceParam : 'all',
  })
}
