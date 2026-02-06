'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useBlogStore } from '@/stores/blog-store'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function BlogPostPage() {
  const params = useParams()
  const postId = params.id as string
  const { post, loading, error, fetchPost } = useBlogStore()

  useEffect(() => {
    if (postId) fetchPost(postId)
  }, [postId, fetchPost])

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            Failed to load the blog post. Please try again later.
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!post) return null

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 max-w-3xl">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">{post.title_text}</h2>

            {/* Cover image */}
            {post.cover_image && (
              <img
                src={post.cover_image.url}
                alt={post.cover_image.description}
                className="w-full rounded-lg mb-6"
              />
            )}

            {/* Elements */}
            <div className="space-y-6">
              {post.elements.map((element) => {
                if (element.isLoading) {
                  return (
                    <div key={element.id} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  )
                }

                return (
                  <div key={element.id} className="border-b pb-4 last:border-0">
                    <span className="text-xs uppercase text-muted-foreground">
                      {element.element_type}
                    </span>
                    {/* Element components will be rendered here in Phase 4 */}
                    <pre className="mt-2 text-sm whitespace-pre-wrap">
                      {JSON.stringify(element.content, null, 2)}
                    </pre>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Post Info</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Status: {post.status}</p>
              <p>Created: {new Date(post.created_at).toLocaleDateString()}</p>
              <p>Elements: {post.elements.length}</p>
              {post.focus_keyword && <p>Keyword: {post.focus_keyword}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
