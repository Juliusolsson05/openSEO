'use client'

/**
 * Blog list page — premium redesign
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  FileText,
  Eye,
  Pencil,
  Sparkles,
  Plus,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
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

/** Unwrap DRF / backend paginated response */
function unwrapList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw
  return raw?.data ?? raw?.results ?? raw?.items ?? []
}

export default function BlogPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<BlogPostSummary[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPostSummary[]>([])
  const [titles, setTitles] = useState<BlogTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const postsLeftToGenerate = titles.filter((t) => t.status === 1).length
  const publishedCount = posts.filter((p) => p.is_published).length
  const draftCount = posts.filter((p) => !p.is_published).length

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [postsRes, titlesRes] = await Promise.all([
        api<any>('/api/aurora/blog/posts/'),
        api<any>('/api/aurora/blog/titles/'),
      ])
      if (postsRes.data) setPosts(unwrapList<BlogPostSummary>(postsRes.data))
      if (postsRes.error) console.error('[Blog] posts error:', postsRes.error)
      if (titlesRes.data) setTitles(unwrapList<BlogTitle>(titlesRes.data))
      if (titlesRes.error) console.error('[Blog] titles error:', titlesRes.error)
    } catch (err) {
      console.error('[Blog] fetchData error:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const statusConfig = (status: number, published: boolean) => {
    if (published)
      return { text: 'Published', variant: 'success' as const, icon: CheckCircle2 }
    if (status === 2)
      return { text: 'Draft', variant: 'warning' as const, icon: Clock }
    if (status === 3)
      return { text: 'Scheduled', variant: 'default' as const, icon: Clock }
    return { text: 'Pending', variant: 'outline' as const, icon: AlertCircle }
  }

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger">
        <Card className="group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Total Posts</p>
                <p className="text-2xl font-bold mt-1">{loading ? '—' : posts.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Published</p>
                <p className="text-2xl font-bold mt-1 text-success">{loading ? '—' : publishedCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success group-hover:bg-success/15 transition-colors">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Drafts</p>
                <p className="text-2xl font-bold mt-1 text-warning">{loading ? '—' : draftCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning group-hover:bg-warning/15 transition-colors">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Queue</p>
                <p className="text-2xl font-bold mt-1">{loading ? '—' : postsLeftToGenerate}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info group-hover:bg-info/15 transition-colors">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search posts by title, keyword, or excerpt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-3.5 w-3.5" /> Filter
        </Button>

        <div className="flex-1" />

        <Button
          variant="glow"
          onClick={generateNext}
          disabled={generating || postsLeftToGenerate === 0}
          className="gap-2"
        >
          {generating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Post
            </>
          )}
        </Button>
      </div>

      {/* Posts list */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-[15px] font-medium">
                {searchQuery ? 'No posts match your search' : 'No blog posts yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Generate your first post from available titles'}
              </p>
              {!searchQuery && postsLeftToGenerate > 0 && (
                <Button
                  variant="glow"
                  className="mt-4 gap-2"
                  onClick={generateNext}
                  disabled={generating}
                >
                  <Sparkles className="h-4 w-4" /> Generate First Post
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredPosts.map((post, idx) => {
                const status = statusConfig(post.status, post.is_published)
                const StatusIcon = status.icon
                return (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-4 hover:bg-accent/40 cursor-pointer transition-all duration-200 group"
                    style={{ animationDelay: `${idx * 40}ms` }}
                    onClick={() => router.push(`/blog/${post.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0 ring-1 ring-border/40">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <FileText className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-medium truncate group-hover:text-primary transition-colors">
                        {post.title_text}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.text}
                        </Badge>
                        <span className="text-[12px] text-muted-foreground">
                          {post.elements.length} elements
                        </span>
                        {post.focus_keyword && (
                          <span className="text-[12px] text-muted-foreground">
                            · {post.focus_keyword}
                          </span>
                        )}
                        <span className="text-[12px] text-muted-foreground ml-auto">
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: open external link
                        }}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
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
