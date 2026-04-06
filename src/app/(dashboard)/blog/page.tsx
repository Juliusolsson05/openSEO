'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import BlogCategoriesTable from '@/components/blog/BlogCategoriesTable'
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
  LayoutGrid,
  LayoutList,
  ArrowRight,
} from 'lucide-react'
import { usePostsQuery, useGeneratePostMutation } from '@/hooks/queries/blog'
import { useTitlesQuery } from '@/hooks/queries/titles'

import type { BlogTitle, BlogPostSummary } from '@/types/blog'


const statusConfig = (status: number | string, published: boolean) => {
  if (published)
    return { text: 'Published', variant: 'success' as const, icon: CheckCircle2 }
  const s = typeof status === 'string' ? status.toUpperCase() : status
  if (s === 'GENERATED' || s === 2)
    return { text: 'Draft', variant: 'warning' as const, icon: Clock }
  if (s === 'SCHEDULED' || s === 3)
    return { text: 'Scheduled', variant: 'default' as const, icon: Clock }
  if (s === 'TO_BE_GENERATED' || s === 1)
    return { text: 'In Queue', variant: 'outline' as const, icon: AlertCircle }
  return { text: 'Pending', variant: 'outline' as const, icon: AlertCircle }
}

function BlogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: postsPagesData,
    isLoading: loading,
    fetchNextPage: fetchMorePosts,
    hasNextPage: hasMorePosts,
    isFetchingNextPage: loadingMorePosts,
  } = usePostsQuery()
  const posts = useMemo<BlogPostSummary[]>(
    () => postsPagesData?.pages.flatMap((p) => p.data) ?? [],
    [postsPagesData],
  )
  const { data: rawTitlesPages } = useTitlesQuery()
  const titles = useMemo<BlogTitle[]>(
    () => rawTitlesPages?.pages.flatMap((p) => p.data) ?? [],
    [rawTitlesPages],
  )
  const generatePost = useGeneratePostMutation()

  const postsLeftToGenerate = titles.filter((t) => {
    const s = t.status as number | string
    const status = typeof s === 'string' ? s.toUpperCase() : s
    return status === 1 || status === 'TO_BE_GENERATED'
  }).length
  const publishedCount = posts.filter((p) => p.is_published).length
  const draftCount = posts.filter((p) => !p.is_published).length



  useEffect(() => {
    const fromQuery = searchParams.get('search')
    if (fromQuery && fromQuery !== searchQuery) {
      queueMicrotask(() => setSearchQuery(fromQuery))
    }
  }, [searchParams, searchQuery])

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    const q = searchQuery.toLowerCase()
    return posts.filter(
      (p) =>
        p.title_text.toLowerCase().includes(q) ||
        p.focus_keyword?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q),
    )
  }, [searchQuery, posts])

  const generateNext = async () => {
    try {
      await generatePost.mutateAsync(undefined)
    } catch {
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          { label: 'TOTAL POSTS', value: posts.length, color: 'text-foreground' },
          { label: 'PUBLISHED', value: publishedCount, color: 'text-success' },
          { label: 'DRAFTS', value: draftCount, color: 'text-warning-foreground' },
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

        <div className="flex border border-border rounded-sm overflow-hidden">
          <Button
            size="icon"
            variant={view === 'list' ? 'default' : 'ghost'}
            onClick={() => setView('list')}
            className="h-7 w-8 rounded-none"
          >
            <LayoutList className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant={view === 'grid' ? 'default' : 'ghost'}
            onClick={() => setView('grid')}
            className="h-7 w-8 rounded-none border-l border-border"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1" />

        <Button
          data-tour="generate-post-btn"
          onClick={generateNext}
          disabled={generatePost.isPending || postsLeftToGenerate === 0}
          className="gap-1.5"
        >
          {generatePost.isPending ? (
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

      {loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-44 w-full rounded-b-none" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-11 w-16" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center py-16 px-6">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-[14px] font-semibold">
                {searchQuery ? 'No posts match your search' : 'No blog posts yet'}
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {searchQuery ? 'Try different keywords.' : 'Generate your first post to get started.'}
              </p>
              {!searchQuery && postsLeftToGenerate > 0 && (
                <Button className="mt-4 gap-1.5" onClick={generateNext} disabled={generatePost.isPending}>
                  <Sparkles className="h-3.5 w-3.5" /> Generate First Post
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        /* ─── Grid view ─────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {filteredPosts.map((post) => {
            const status = statusConfig(post.status, post.is_published)
            const StatusIcon = status.icon
            return (
              <Card
                key={post.id}
                className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors group"
                onClick={() => router.push(`/blog/${post.id}`)}
              >
                <div className="h-44 bg-secondary overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-info-light to-background">
                      <FileText className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.text}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground ml-auto">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-[14px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title_text}
                  </h3>

                  {post.excerpt && (
                    <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground">
                      {post.elements.length} elements
                      {post.focus_keyword && <> · {post.focus_keyword}</>}
                    </span>
                    <span className="text-primary text-[12px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {hasMorePosts && (
            <div className="flex justify-center py-4 col-span-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchMorePosts()}
                disabled={loadingMorePosts}
              >
                {loadingMorePosts ? 'Loading…' : 'Load more posts'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* ─── List view ─────────────────────────────────────── */
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
              <div className="w-16" />
              <div className="flex-1">Title</div>
              <div className="w-24">Status</div>
              <div className="w-24">Elements</div>
              <div className="w-28">Created</div>
              <div className="w-20" />
            </div>

            {filteredPosts.map((post) => {
              const status = statusConfig(post.status, post.is_published)
              const StatusIcon = status.icon
              return (
                <div
                  key={post.id}
                  className="flex items-center gap-4 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted cursor-pointer transition-colors group"
                  onClick={() => router.push(`/blog/${post.id}`)}
                >
                  <div className="w-16 h-11 rounded-sm overflow-hidden bg-secondary shrink-0 border border-border/60">
                    {post.cover_image ? (
                      <img src={post.cover_image.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

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

                  <div className="w-24">
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.text}
                    </Badge>
                  </div>

                  <div className="w-24 text-[13px] text-muted-foreground">
                    {post.elements.length} elements
                  </div>

                  <div className="w-28 text-[12px] text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>

                  <div className="w-20 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); router.push(`/blog/${post.id}`) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); router.push(`/blog/${post.id}/preview`) }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 my-auto" />
                  </div>
                </div>
              )
            })}
            {hasMorePosts && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchMorePosts()}
                  disabled={loadingMorePosts}
                >
                  {loadingMorePosts ? 'Loading…' : 'Load more posts'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <BlogCategoriesTable />
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogPageContent />
    </Suspense>
  )
}
