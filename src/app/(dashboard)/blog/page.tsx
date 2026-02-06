'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  FileText,
  Eye,
  Pencil,
  Sparkles,
  Filter,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { api, apiPost } from '@/lib/api'

interface BlogTitle { id: number; title_text: string; status: number }

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
      if (titlesRes.data) setTitles(unwrapList<BlogTitle>(titlesRes.data))
    } catch (err) {
      console.error('[Blog] fetchData error:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

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
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          { label: 'TOTAL POSTS', value: posts.length, color: 'text-foreground' },
          { label: 'PUBLISHED', value: publishedCount, color: 'text-success' },
          { label: 'DRAFTS', value: draftCount, color: 'text-[#835C00]' },
          { label: 'IN QUEUE', value: postsLeftToGenerate, color: 'text-primary' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">
                {stat.label}
              </p>
              <p className={`text-[28px] font-semibold mt-1 leading-none ${stat.color}`}>
                {loading ? '–' : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-border bg-white pl-8 pr-3 text-[13px] placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3 w-3" /> Filter
        </Button>

        <div className="flex-1" />

        <Button
          onClick={generateNext}
          disabled={generating || postsLeftToGenerate === 0}
          className="gap-1.5"
        >
          {generating ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Generate Post
            </>
          )}
        </Button>
      </div>

      {/* Posts table */}
      <Card>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
            <div className="w-16" />
            <div className="flex-1">Title</div>
            <div className="w-24">Status</div>
            <div className="w-24">Elements</div>
            <div className="w-28">Created</div>
            <div className="w-20" />
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-11 w-16" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center py-16 px-6">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-[14px] font-semibold">
                {searchQuery ? 'No posts match your search' : 'No blog posts yet'}
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {searchQuery ? 'Try different keywords.' : 'Generate your first post to get started.'}
              </p>
              {!searchQuery && postsLeftToGenerate > 0 && (
                <Button className="mt-4 gap-1.5" onClick={generateNext} disabled={generating}>
                  <Sparkles className="h-3.5 w-3.5" /> Generate First Post
                </Button>
              )}
            </div>
          ) : (
            <div>
              {filteredPosts.map((post) => {
                const status = statusConfig(post.status, post.is_published)
                const StatusIcon = status.icon
                return (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-[#F8F8F8] cursor-pointer transition-colors group"
                    onClick={() => router.push(`/blog/${post.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-11 rounded-sm overflow-hidden bg-secondary shrink-0 border border-border/60">
                      {post.cover_image ? (
                        <img src={post.cover_image.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Title + keyword */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">
                        {post.title_text}
                      </p>
                      {post.focus_keyword && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {post.focus_keyword}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-24">
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.text}
                      </Badge>
                    </div>

                    {/* Elements count */}
                    <div className="w-24 text-[13px] text-muted-foreground">
                      {post.elements.length} elements
                    </div>

                    {/* Date */}
                    <div className="w-28 text-[12px] text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </div>

                    {/* Actions */}
                    <div className="w-20 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); router.push(`/blog/${post.id}`) }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); router.push(`/blog/${post.id}/preview`) }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 my-auto" />
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
