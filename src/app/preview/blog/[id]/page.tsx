'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Share2,
  Search,
  Rocket,
  Mail,
  Calendar,
  Tag,
} from 'lucide-react'

import '@/components/blog/elements'
import { ElementRenderer } from '@/components/blog/elements/ElementRenderer'
import { getPreviewComponent } from '@/components/blog/elements/registry'
import type { BlogPost, BlogPostElement } from '@/types/blog'

type Keyword = { keyword: string; description: string; count: number }

const trendingTopics = ['Tech Trends', 'Innovation', 'Future of Work', 'Productivity', 'Leadership']

const featuredAuthors = [
  { name: 'Sarah Mitchell', role: 'Lead Tech Writer' },
  { name: 'James Wilson', role: 'Senior Analyst' },
  { name: 'Emma Chen', role: 'Product Strategist' },
]

const upcomingEvents = [
  { title: 'Annual Tech Summit', date: 'June 15, 2026', location: 'Virtual & In-Person' },
  { title: 'Product Strategy Workshop', date: 'June 22, 2026', location: 'Innovation Center' },
  { title: 'Leadership Forum', date: 'July 1, 2026', location: 'Main Conference Hall' },
]

function extractTopKeywords(elements: BlogPostElement[]): Keyword[] {
  const map: Record<string, Keyword> = {}

  elements.forEach((element) => {
    const kw = element.hyperlink?.matched_keywords?.text
    if (!kw?.length) return

    kw.forEach((item) => {
      if (!map[item.keyword]) {
        map[item.keyword] = {
          keyword: item.keyword,
          description: item.description,
          count: 0,
        }
      }
      map[item.keyword].count += item.matched_positions?.length || 1
    })
  })

  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

function getImageNumbers(elements: BlogPostElement[]) {
  const numbers: Record<number, number> = {}
  let count = 0

  elements.forEach((element) => {
    if (String(element.element_type).toLowerCase() === 'image') {
      count += 1
      numbers[element.id as number] = count
    }
  })

  return numbers
}

export default function BlogPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showHeaderFooter, setShowHeaderFooter] = useState(true)
  const [companyName, setCompanyName] = useState('Your Company')

  const ContextPreview = getPreviewComponent('context' as any)
  const CoverPreview = getPreviewComponent('image' as any)

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      setError(false)

      try {
        const data = await api<BlogPost>(`/api/aurora/blog/posts?post_id=${postId}`)
        if (!data) setError(true)
        else setPost(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (postId) fetchPost()
  }, [postId])

  useEffect(() => {
    const storedCompany = localStorage.getItem('Company-Name')
    if (storedCompany) setCompanyName(storedCompany)
  }, [])

  useEffect(() => {
    const companyVal = (post as any)?.company
    if (post && typeof companyVal === 'string' && companyVal.trim()) {
      setCompanyName(companyVal)
    }
  }, [post])

  const topKeywords = useMemo(() => (post ? extractTopKeywords(post.elements) : []), [post])
  const imageNumbers = useMemo(() => (post ? getImageNumbers(post.elements) : {}), [post])

  const sharePost = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // no-op placeholder
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground [font-family:'Segoe_UI',SegoeUI,Segoe_UI_Web,Arial,sans-serif]">
      {showHeaderFooter && (
        <header className="h-20 border-b border-border bg-white">
          <div className="mx-auto flex h-full w-full max-w-[1280px] items-center px-6">
            <div className="mr-3 h-10 w-10 rounded-sm bg-primary" />
            <div className="text-xl font-semibold">{companyName} Example Blog</div>
            <nav className="ml-auto hidden items-center gap-6 text-sm text-foreground md:flex">
              <span>Products</span>
              <span>About Us</span>
              <span>Support</span>
              <span>Contact</span>
            </nav>
          </div>
        </header>
      )}

      <Card className="fixed left-4 top-24 z-50 rounded border-border bg-white p-2 shadow-none">
        <CardContent className="flex flex-col gap-2 p-0">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/blog/${postId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowHeaderFooter((v) => !v)}>
            {showHeaderFooter ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={sharePost}>
            <Share2 className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 lg:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-9">
            {loading && (
              <div className="mx-auto max-w-[720px] space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}

            {!loading && error && (
              <Card className="mx-auto max-w-[720px] rounded border-border bg-white shadow-none">
                <CardContent className="p-8 text-center">
                  Failed to load preview.
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => router.push(`/blog/${postId}`)}>Go back</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && !error && post && (
              <article id="post-container" className="mx-auto max-w-[720px]">
                <div className="mb-4 text-xs text-muted-foreground">
                  Home / Blog / {post.title_text.length > 30 ? `${post.title_text.slice(0, 30)}...` : post.title_text}
                </div>

                <h1 className="mb-6 text-4xl font-semibold leading-tight">{post.title_text}</h1>

                {post.cover_image && (
                  <div className="mb-6">
                    <CoverPreview
                      content={post.cover_image}
                      companyName={companyName}
                      blogId={post.id}
                      postTitle={post.title_text}
                      imageNumber={1}
                      isCoverImage
                    />
                  </div>
                )}

                <ContextPreview content={{ elements: post.elements }} elements={post.elements} />

                <div>
                  {post.elements.map((element) => (
                    <div key={element.id} id={`section-${element.id}`} className="scroll-mt-24">
                      <ElementRenderer
                        element={element}
                        blogId={post.id}
                        editable={false}
                        preview
                        previewProps={{
                          blogId: post.id,
                          elementId: element.id as number,
                          postTitle: post.title_text,
                          imageNumber: imageNumbers[element.id as number] ? imageNumbers[element.id as number] + 1 : null,
                          hyperlink: element.hyperlink,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </article>
            )}
          </section>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 space-y-4">
              <Card className="rounded border-border shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Glossary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topKeywords.length ? topKeywords.map((kw) => (
                    <div key={kw.keyword} className="border-b border-border pb-2 last:border-0">
                      <p className="text-sm font-semibold text-primary">{kw.keyword}</p>
                      <p className="text-xs text-muted-foreground">{kw.description}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No linked keywords</p>}
                </CardContent>
              </Card>

              <Card className="rounded border-border shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Related Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {post?.linked_posts?.slice(0, 5).map((linked) => (
                    <Link key={linked.id} href={`/blog/${linked.id}`} className="block rounded border border-border p-2 hover:border-primary">
                      {linked.cover_image?.url && (
                        <img src={linked.cover_image.url} alt="" className="mb-2 h-24 w-full rounded-sm object-cover" />
                      )}
                      <p className="text-sm font-semibold">{linked.title_text}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{linked.excerpt}</p>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded border-border shadow-none">
                <CardContent className="space-y-4 p-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold">Search</p>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-8" placeholder="Search articles..." />
                    </div>
                  </div>

                  <div className="rounded border border-border p-3">
                    <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><Rocket className="h-4 w-4 text-primary" /> Product Showcase</p>
                    <p className="mb-2 text-xs text-muted-foreground">Read more about our awesome product that does awesome things.</p>
                    <Button className="h-8 w-full rounded-sm bg-primary hover:bg-primary-hover">Learn More</Button>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">Featured Authors</p>
                    <div className="space-y-2">
                      {featuredAuthors.map((author) => (
                        <div key={author.name} className="rounded border border-border p-2">
                          <p className="text-sm font-medium">{author.name}</p>
                          <p className="text-xs text-muted-foreground">{author.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded border border-border p-3">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-primary" /> Newsletter</p>
                    <Input placeholder="Enter your email" />
                    <Button className="mt-2 h-8 w-full rounded-sm bg-primary hover:bg-primary-hover">Subscribe</Button>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Tag className="h-4 w-4 text-primary" /> Trending Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((topic) => (
                        <Badge key={topic} variant="outline" className="rounded-sm">{topic}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Calendar className="h-4 w-4 text-primary" /> Upcoming Events</p>
                    <div className="space-y-2">
                      {upcomingEvents.map((event) => (
                        <div key={event.title} className="rounded border border-border p-2">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      {showHeaderFooter && (
        <footer className="border-t border-border bg-white">
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-6 py-8 md:grid-cols-4">
            <div>
              <h3 className="mb-3 text-base font-semibold">{companyName}</h3>
              <p className="text-sm text-muted-foreground">A preview-only footer to simulate a real public website around this blog post.</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground"><li>Home</li><li>Products</li><li>Services</li></ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground"><li>Documentation</li><li>FAQ</li><li>Blog</li></ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground"><li>123 Preview St.</li><li>fake@example.com</li><li>(555) 123-4567</li></ul>
            </div>
          </div>
          <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {companyName}. All rights reserved. (Preview Mode)
          </div>
        </footer>
      )}
    </div>
  )
}
