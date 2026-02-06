'use client'

/**
 * Blog post editor — premium redesign
 */

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBlogStore } from '@/stores/blog-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Eye,
  ArrowLeft,
  RefreshCw,
  Globe,
  Tag,
  Calendar,
  Layers,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react'

// Import element barrel — triggers ALL registerElement() calls
import '@/components/blog/elements'
import { ElementRenderer } from '@/components/blog/elements/ElementRenderer'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { post, loading, error, fetchPost } = useBlogStore()

  useEffect(() => {
    if (postId) fetchPost(postId)
  }, [postId, fetchPost])

  const handleRefresh = () => {
    if (postId) fetchPost(postId, true)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="flex-1 max-w-3xl space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div className="w-72 shrink-0 hidden lg:block space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mx-auto mb-4">
          <ExternalLink className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-[15px] font-medium">Failed to load blog post</p>
        <p className="text-sm text-muted-foreground mt-1">The post may have been deleted or is temporarily unavailable.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/blog')}>
          Back to posts
        </Button>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="max-w-6xl mx-auto animate-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push('/blog')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-border" />
          <Badge variant={post.is_published ? 'success' : 'warning'} className="gap-1">
            {post.is_published ? (
              <><CheckCircle2 className="h-3 w-3" /> Published</>
            ) : (
              <><Clock className="h-3 w-3" /> Draft</>
            )}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/blog/${postId}/preview`)} className="gap-2">
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button variant="glow" size="sm" className="gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Autopilot
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 max-w-3xl">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold leading-tight tracking-tight mb-6">
                {post.title_text}
              </h1>

              {/* Cover image */}
              {post.cover_image && (
                <div className="mb-8 rounded-xl overflow-hidden ring-1 ring-border/40">
                  <img
                    src={post.cover_image.url}
                    alt={post.cover_image.description}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Elements */}
              <div className="space-y-3">
                {post.elements.map((element) => (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    blogId={post.id}
                    editable={true}
                  />
                ))}
              </div>

              {post.elements.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                    <Layers className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-[15px] font-medium">No elements yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Use Autopilot to generate content or add elements manually.
                  </p>
                  <Button variant="glow" className="mt-4 gap-2">
                    <Sparkles className="h-4 w-4" /> Run Autopilot
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 space-y-4 hidden lg:block">
          {/* Post info card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Post Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Layers className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] text-muted-foreground">Elements</p>
                    <p className="text-[14px] font-medium">{post.elements.length}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] text-muted-foreground">Created</p>
                    <p className="text-[14px] font-medium">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {post.focus_keyword && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[12px] text-muted-foreground">Focus Keyword</p>
                      <p className="text-[14px] font-medium">{post.focus_keyword}</p>
                    </div>
                  </div>
                )}

                {post.slug && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] text-muted-foreground">Slug</p>
                      <p className="text-[13px] font-mono text-muted-foreground break-all leading-relaxed">{post.slug}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO card */}
          {(post.seo_title || post.meta_description) && (
            <Card>
              <CardContent className="p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  SEO
                </h3>
                <div className="space-y-3">
                  {post.seo_title && (
                    <div>
                      <p className="text-[12px] text-muted-foreground mb-0.5">Title Tag</p>
                      <p className="text-[13px] leading-relaxed">{post.seo_title}</p>
                      <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min((post.seo_title.length / 60) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {post.seo_title.length}/60 characters
                      </p>
                    </div>
                  )}

                  {post.meta_description && (
                    <div>
                      <p className="text-[12px] text-muted-foreground mb-0.5">Meta Description</p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">{post.meta_description}</p>
                      <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min((post.meta_description.length / 160) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {post.meta_description.length}/160 characters
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.categories.map((cat) => (
                    <Badge key={cat.id} variant="outline" className="text-[12px]">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
