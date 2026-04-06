import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { api } from '@/lib/api'
import { SitePostRenderer } from '@/app/site/_components/SitePostRenderer'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type SharedPost = {
  id: number
  title_text: string
  cover_image?: { url?: string; description?: string } | null
  elements: Array<{
    id: number
    order: number
    element_type: string
    content: any
  }>
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-4 py-3">
          <div className="text-[18px] font-semibold text-primary">OpenSEO</div>
          <Badge>Shared preview</Badge>
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-4 py-8">{children}</main>
      <footer className="mt-10 border-t border-border bg-white">
        <div className="mx-auto max-w-[720px] px-4 py-4 text-[12px] text-muted-foreground">
          Powered by OpenSEO
        </div>
      </footer>
    </div>
  )
}

function Message({ text }: { text: string }) {
  return (
    <Shell>
      <Card className="rounded border-border bg-white shadow-none">
        <CardContent className="p-5 text-[14px]">{text}</CardContent>
      </Card>
    </Shell>
  )
}

async function fetchPost(postId: number): Promise<SharedPost | null> {
  try {
    const data = await api<SharedPost>(`/api/aurora/blog/posts?post_id=${postId}`, {
      method: 'GET',
    })
    if (data && typeof data === 'object') return data
  } catch {
    // fall through to local prisma lookup
  }

  const local = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: {
        elements: {
          orderBy: { order: 'asc' },
          select: { id: true, order: true, element_type: true, content: true },
        },
      },
    })

  if (!local) return null

  return {
    id: local.id,
    title_text: local.title_text,
    cover_image: (local.cover_image as any) ?? null,
    elements: local.elements,
  }
}

export default async function SharedBlogPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  if (!token) notFound()

  const link = await prisma.shareLink.findUnique({ where: { token } })

  if (!link || !link.enabled || link.revokedAt !== null) {
    return <Message text="This link is invalid or has been revoked" />
  }

  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return <Message text="This link has expired" />
  }

  const post = await fetchPost(link.postId)

  if (!post) {
    return <Message text="This link is invalid or has been revoked" />
  }

  return (
    <Shell>
      <Card className="rounded border-border bg-white shadow-none">
        <CardContent className="p-6">
          <article>
            <h1 className="mb-6 text-[32px] font-semibold leading-tight">{post.title_text}</h1>

            {post.cover_image?.url ? (
              <div className="mb-8 overflow-hidden rounded border border-border">
                <img
                  src={post.cover_image.url}
                  alt={post.cover_image.description || post.title_text}
                  className="h-auto w-full"
                />
              </div>
            ) : null}

            <div>
              <SitePostRenderer elements={post.elements as any} />
            </div>
          </article>
        </CardContent>
      </Card>
    </Shell>
  )
}
