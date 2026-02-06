'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Pencil } from 'lucide-react'
import { api } from '@/lib/api'

import '@/components/blog/elements'
import { ElementRenderer } from '@/components/blog/elements/ElementRenderer'
import type { BlogPost } from '@/stores/types'

export default function BlogPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      setError(false)
      const { data, error: err } = await api<BlogPost>(`/api/aurora/blog/posts?post_id=${postId}`)
      if (err || !data) {
        setError(true)
      } else {
        setPost(data)
      }
      setLoading(false)
    }
    if (postId) fetchPost()
  }, [postId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-[14px] font-semibold">Failed to load preview</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/blog/${postId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-[13px] text-muted-foreground">Preview Mode</span>
          <Badge variant="default" className="ml-1">Read-only</Badge>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push(`/blog/${postId}`)}>
          <Pencil className="h-3 w-3" /> Edit Post
        </Button>
      </div>

      {/* Article */}
      <Card>
        <CardContent className="p-8 lg:p-10">
          {/* Breadcrumbs */}
          <div className="text-[12px] text-muted-foreground mb-6">
            <span>Home</span>
            <span className="mx-1.5">›</span>
            <span>Blog</span>
            <span className="mx-1.5">›</span>
            <span className="text-foreground font-medium">
              {post.title_text.length > 50 ? post.title_text.substring(0, 50).trimEnd() + '...' : post.title_text}
            </span>
          </div>

          <h1 className="text-[28px] font-semibold leading-tight mb-6">{post.title_text}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground mb-8 pb-5 border-b border-border">
            <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            {post.focus_keyword && (
              <>
                <span>·</span>
                <span className="text-primary font-medium">{post.focus_keyword}</span>
              </>
            )}
            <span>·</span>
            <span>{post.elements.length} sections</span>
          </div>

          {/* Cover */}
          {post.cover_image && (
            <div className="mb-8 rounded-sm overflow-hidden border border-border">
              <img src={post.cover_image.url} alt={post.cover_image.description} className="w-full h-auto" />
            </div>
          )}

          {/* Elements */}
          <div className="space-y-4">
            {post.elements.map((element) => (
              <ElementRenderer key={element.id} element={element} blogId={post.id} editable={false} />
            ))}
          </div>

          {/* Related posts */}
          {post.linked_posts && post.linked_posts.length > 0 && (
            <div className="mt-12 pt-6 border-t border-border">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-4">
                RELATED POSTS
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {post.linked_posts.map((linked) => (
                  <Card key={linked.id} className="cursor-pointer hover:border-primary/30 transition-colors">
                    <div className="flex gap-3 p-3">
                      {linked.cover_image && (
                        <img src={linked.cover_image.url} alt="" className="w-16 h-11 object-cover rounded-sm border border-border" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-semibold truncate">{linked.title_text}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{linked.excerpt}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
