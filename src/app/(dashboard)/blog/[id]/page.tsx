'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePostQuery } from '@/hooks/queries/blog'
import { invalidatePost } from '@/store/slices/blogUiSlice'
import { useAppDispatch } from '@/store/hooks'
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
import { ContextPreview } from '@/components/blog/elements/context/ContextPreview'
import { InlineEditProvider } from '@/components/blog/elements/inline'
import QuilloChat from '@/components/blog/QuilloChat'
import QuilloAutopilot from '@/components/blog/QuilloAutopilot'
import { ImageStudio } from '@/components/blog/ImageStudio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import BlogGlossary from '@/components/blog/BlogGlossary'
import AdminMenu from '@/components/blog/AdminMenu'
import PostInfoSidepanel from '@/components/blog/PostInfoSidepanel'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const postId = params.id as string
  const { data: post, isLoading, isError, refetch } = usePostQuery(postId)
  const [coverStudioOpen, setCoverStudioOpen] = useState(false)

  const refreshPost = () => {
    dispatch(invalidatePost(postId) as any)
    refetch()
  }

  if (isLoading) {
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

  if (isError) {
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
          <Button variant="ghost" size="sm" onClick={refreshPost} className="gap-1.5">
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
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-[22px] font-semibold leading-tight mb-5">{post.title_text}</h1>

              {post.cover_image && (
                <Button type="button" variant="outline" className="group relative mb-6 block h-auto w-full overflow-hidden p-0 text-left" onClick={() => setCoverStudioOpen(true)}>
                  <img src={post.cover_image.url} alt={post.cover_image.description} className="h-auto w-full" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                    ✏️ Edit in Studio
                  </div>
                </Button>
              )}

              <InlineEditProvider>
                <div>
                  <ContextPreview
                    content={{ elements: post.elements }}
                    elements={post.elements as any}
                  />
                  {post.elements.map((element) => (
                    <div key={element.id} id={`section-${element.id}`} className="scroll-mt-24">
                      <ElementRenderer element={element} blogId={post.id} editable={true} />
                    </div>
                  ))}
                </div>
              </InlineEditProvider>

              <RelatedPosts posts={post.linked_posts ?? []} variant="grid" />

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

        <div className="w-64 shrink-0 space-y-4 hidden lg:block">
          <AdminMenu postId={post.id} onRefreshPost={refreshPost} />

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

          <PostInfoSidepanel
            post={post as any}
            onUpdatePost={refreshPost}
          />

          <BlogGlossary elements={post.elements} />

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

          <RelatedPosts posts={post.linked_posts ?? []} variant="sidebar" />
        </div>
      </div>

      {post.cover_image ? (
        <ImageStudio
          open={coverStudioOpen}
          onClose={() => setCoverStudioOpen(false)}
          blogId={post.id}
          imageNumber={1}
          currentUrl={post.cover_image.url}
          currentDescription={post.cover_image.description}
          postTitle={post.title_text}
          onImageApplied={refreshPost}
        />
      ) : null}

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
