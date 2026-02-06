'use client'

/**
 * Blog list page — ported from aurora_dashboard/pages/blog.vue
 * Shows post management, search, generation, and post list.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, FileText, Eye, Pencil, ExternalLink } from 'lucide-react'
import { api, apiPost } from '@/lib/api'

interface BlogTitle {
  id: number
  title_text: string
  status: number
}

interface BlogPostSummary {
  id: number
  title_text: string
  slug: string
  status: number
  is_published: boolean
  created_at: string
  cover_image: { url: string; description: string } | null
  elements: { id: number; element_type: string }[]
  focus_keyword: string
  excerpt: string
}

export default function BlogPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'search' | 'generate'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<BlogPostSummary[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPostSummary[]>([])
  const [titles, setTitles] = useState<BlogTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const postsLeftToGenerate = titles.filter((t) => t.status === 1).length

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [postsRes, titlesRes] = await Promise.all([
      api<BlogPostSummary[]>('/api/aurora/blog/posts/list/'),
      api<BlogTitle[]>('/api/aurora/blog/titles/'),
    ])
    if (postsRes.data) setPosts(postsRes.data)
    if (titlesRes.data) setTitles(titlesRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter posts by search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredPosts(
        posts.filter(
          (p) =>
            p.title_text.toLowerCase().includes(q) ||
            p.focus_keyword?.toLowerCase().includes(q) ||
            p.excerpt?.toLowerCase().includes(q)
        )
      )
    }
  }, [searchQuery, posts])

  const generateNext = async () => {
    setGenerating(true)
    await apiPost('/api/aurora/blog/posts/generate/', {})
    await fetchData()
    setGenerating(false)
  }

  const statusLabel = (status: number, published: boolean) => {
    if (published) return { text: 'Published', color: 'bg-green-100 text-green-800' }
    if (status === 2) return { text: 'Draft', color: 'bg-yellow-100 text-yellow-800' }
    if (status === 3) return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800' }
    return { text: 'Pending', color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div className="space-y-6">
      {/* Management Section */}
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Blog Post Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={activeTab === 'search' ? 'default' : 'outline'}
              onClick={() => setActiveTab('search')}
            >
              Search Posts
            </Button>
            <Button
              variant={activeTab === 'generate' ? 'default' : 'outline'}
              onClick={() => setActiveTab('generate')}
            >
              Generate New Posts
            </Button>
          </div>

          {activeTab === 'search' && (
            <div className="mx-auto max-w-lg space-y-4 text-center">
              <p className="text-muted-foreground">
                Review, edit, and manage the blog posts generated for your website.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Find a blog post"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="mx-auto max-w-lg space-y-4 text-center">
              <p className="text-muted-foreground">
                You have {postsLeftToGenerate} posts left to generate.
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={generateNext} disabled={generating || postsLeftToGenerate === 0}>
                  {generating ? 'Generating...' : 'Generate Next'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts list */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-24 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No posts match your search.' : 'No blog posts yet. Generate some from your titles!'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const status = statusLabel(post.status, post.is_published)
                return (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/blog/${post.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded overflow-hidden bg-muted shrink-0">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{post.title_text}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {post.elements.length} elements
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/blog/${post.id}`)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/blog/${post.id}/preview`)
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
