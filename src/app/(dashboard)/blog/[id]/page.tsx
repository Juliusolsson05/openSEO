'use client'

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
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react'

import '@/components/blog/elements'
import { ElementRenderer } from '@/components/blog/elements/ElementRenderer'
import QuilloChat from '@/components/blog/QuilloChat'
import QuilloAutopilot from '@/components/blog/QuilloAutopilot'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { post, loading, error, fetchPost } = useBlogStore()

  useEffect(() => {
    if (postId) fetchPost(postId)
  }, [postId, fetchPost])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
        <div className="w-64 shrink-0 hidden lg:block space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <FileTextIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-[14px] font-semibold">Failed to load blog post</p>
        <p className="text-[13px] text-muted-foreground mt-1">
          The post may have been deleted or is temporarily unavailable.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/blog')}>
          Back to posts
        </Button>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="max-w-6xl mx-auto animate-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push('/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-[13px] text-muted-foreground">Blog Posts</span>
          <span className="text-[13px] text-muted-foreground">/</span>
          <span className="text-[13px] font-semibold truncate max-w-[300px]">{post.title_text}</span>
          <Badge variant={post.is_published ? 'success' : 'warning'} className="ml-2 gap-1">
            {post.is_published ? <><CheckCircle2 className="h-3 w-3" /> Published</> : <><Clock className="h-3 w-3" /> Draft</>}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchPost(postId, true)} className="gap-1.5">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/blog/${postId}/preview`)} className="gap-1.5">
            <Eye className="h-3 w-3" /> Preview
          </Button>
          <Button size="sm" className="gap-1.5">
            <Sparkles className="h-3 w-3" /> Autopilot
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-[22px] font-semibold leading-tight mb-5">{post.title_text}</h1>

              {post.cover_image && (
                <div className="mb-6 rounded-sm overflow-hidden border border-border">
                  <img src={post.cover_image.url} alt={post.cover_image.description} className="w-full h-auto" />
                </div>
              )}

              <div className="space-y-2">
                {post.elements.map((element) => (
                  <ElementRenderer key={element.id} element={element} blogId={post.id} editable={true} />
                ))}
              </div>

              {post.elements.length === 0 && (
                <div className="text-center py-16">
                  <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-[14px] font-semibold">No elements yet</p>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Use Autopilot to generate content or add elements manually.
                  </p>
                  <Button className="mt-4 gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Run Autopilot
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-4 hidden lg:block">
          {/* Details */}
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-3">
                POST DETAILS
              </p>
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Elements</span>
                  <span className="ml-auto font-semibold">{post.elements.length}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Created</span>
                  <span className="ml-auto font-semibold text-[12px]">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {post.focus_keyword && (
                  <div className="flex items-center gap-2.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Keyword</span>
                    <span className="ml-auto font-semibold text-[12px] truncate max-w-[100px]">{post.focus_keyword}</span>
                  </div>
                )}
                {post.slug && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2.5 mb-1">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground text-[12px]">Slug</span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground break-all leading-relaxed pl-6">
                      /{post.slug}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          {(post.seo_title || post.meta_description) && (
            <Card>
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-3">
                  SEO
                </p>
                <div className="space-y-3">
                  {post.seo_title && (
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">Title Tag</p>
                      <p className="text-[12px] leading-relaxed">{post.seo_title}</p>
                      <div className="mt-1.5 h-[3px] rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((post.seo_title.length / 60) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{post.seo_title.length}/60</p>
                    </div>
                  )}
                  {post.meta_description && (
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-0.5">Meta Description</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{post.meta_description}</p>
                      <div className="mt-1.5 h-[3px] rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((post.meta_description.length / 160) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{post.meta_description.length}/160</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
                  CATEGORIES
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {post.categories.map((cat) => (
                    <Badge key={cat.id} variant="outline" className="text-[11px]">{cat.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quillo AI */}
      <QuilloChat blogPostId={post.id} />
      <QuilloAutopilot postId={post.id} />
    </div>
  )
}

/* Inline icon fallback — avoids extra import */
function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  )
}
