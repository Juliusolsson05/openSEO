'use client'

/**
 * Blog post preview page — ported from aurora_dashboard/pages/apps/blog/preview/[id].vue
 * Read-only rendering of blog elements as they would appear on the public site.
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Eye, EyeOff, Share2 } from 'lucide-react'
import { api } from '@/lib/api'

// Import element barrel for registrations
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
  const [showChrome, setShowChrome] = useState(true)

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
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Failed to load the blog post preview.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Floating controls */}
      <div className="fixed left-4 top-24 z-50 flex flex-col gap-2 bg-background/80 backdrop-blur rounded-lg p-2 shadow-lg border">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => router.push(`/blog/${postId}`)}
          title="Back to editor"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setShowChrome(!showChrome)}
          title="Toggle header/footer"
        >
          {showChrome ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Share">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Fake header */}
      {showChrome && (
        <div className="border-b bg-background mb-8 -mx-6 -mt-6 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg" />
              <span className="font-bold text-lg">Your Company Blog</span>
            </div>
            <nav className="hidden md:flex gap-4 text-sm text-muted-foreground">
              <span>Products</span>
              <span>About</span>
              <span>Support</span>
              <span>Contact</span>
            </nav>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-4">
        <span>Home</span>
        <span className="mx-2">/</span>
        <span>Blog</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">
          {post.title_text.length > 40
            ? post.title_text.substring(0, 40).trimEnd() + '...'
            : post.title_text}
        </span>
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <article className="flex-1 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">{post.title_text}</h1>

          {/* Cover image */}
          {post.cover_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.cover_image.url}
                alt={post.cover_image.description}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Elements — preview mode (no edit actions) */}
          <div className="space-y-4 prose prose-lg max-w-none">
            {post.elements.map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                blogId={post.id}
                editable={false}
              />
            ))}
          </div>

          {/* Related posts */}
          {post.linked_posts && post.linked_posts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.linked_posts.map((linked) => (
                  <Card key={linked.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex gap-3 p-3">
                      {linked.cover_image && (
                        <img
                          src={linked.cover_image.url}
                          alt=""
                          className="w-20 h-14 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{linked.title_text}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{linked.excerpt}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-6">
          {post.focus_keyword && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Focus Keyword</h3>
                <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {post.focus_keyword}
                </span>
              </CardContent>
            </Card>
          )}

          {post.categories && post.categories.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Categories</h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.categories.map((cat) => (
                    <span key={cat.id} className="text-xs px-2 py-1 bg-muted rounded-full">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {/* Fake footer */}
      {showChrome && (
        <div className="border-t bg-muted/30 mt-12 -mx-6 -mb-6 px-6 py-8">
          <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Your Company. All rights reserved. (Preview Mode)</p>
          </div>
        </div>
      )}
    </div>
  )
}
