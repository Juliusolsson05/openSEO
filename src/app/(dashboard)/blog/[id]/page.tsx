'use client'

/**
 * Blog post editor page — ported from aurora_dashboard/pages/apps/blog/post/[id].vue
 * Renders all blog elements with edit/regenerate/enhance/delete actions.
 */

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBlogStore } from '@/stores/blog-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, ArrowLeft, RefreshCw } from 'lucide-react'

// Import the element barrel — this triggers ALL registerElement() calls
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
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-center">
              Failed to load the blog post. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push('/blog')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to posts
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/blog/${postId}/preview`)}>
            <Eye className="h-3.5 w-3.5 mr-2" /> Preview
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 max-w-3xl">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-6">{post.title_text}</h1>

              {/* Cover image */}
              {post.cover_image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={post.cover_image.url}
                    alt={post.cover_image.description}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Elements */}
              <div className="space-y-2">
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
                <div className="text-center py-12 text-muted-foreground">
                  <p>This post has no elements yet.</p>
                  <p className="text-sm mt-1">Use Autopilot or add elements manually.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 space-y-4 hidden lg:block">
          {/* Post info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Post Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={post.is_published ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elements</span>
                  <span>{post.elements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                {post.focus_keyword && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keyword</span>
                    <span className="font-medium">{post.focus_keyword}</span>
                  </div>
                )}
                {post.slug && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-xs">Slug</span>
                    <p className="text-xs font-mono mt-0.5 break-all">{post.slug}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO info */}
          {(post.seo_title || post.meta_description) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">SEO</h3>
                <div className="space-y-2 text-sm">
                  {post.seo_title && (
                    <div>
                      <span className="text-muted-foreground text-xs">SEO Title</span>
                      <p className="mt-0.5">{post.seo_title}</p>
                    </div>
                  )}
                  {post.meta_description && (
                    <div>
                      <span className="text-muted-foreground text-xs">Meta Description</span>
                      <p className="mt-0.5 text-xs">{post.meta_description}</p>
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
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                    >
                      {cat.name}
                    </span>
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
