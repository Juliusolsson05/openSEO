'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Share2,
  Search,
  BookOpen,
  Mail,
  Tag,
} from 'lucide-react'

import type { DashboardDefinition as Definition, DashboardWord as WordDefinition } from '@/types/dictionary'

const clean = (value?: string) => {
  let s = (value || '').replace(/<br\s*\/?>/gi, '\n')
  let prev = ''
  while (s !== prev) { prev = s; s = s.replace(/<[^>]*>/g, '') }
  return s.trim()
}

export default function DictionaryPublicPreviewPage() {
  const params = useParams<{ id: string; wordid: string }>()
  const router = useRouter()
  const [word, setWord] = useState<WordDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showHeaderFooter, setShowHeaderFooter] = useState(true)
  const [companyName, setCompanyName] = useState('Your Company')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const data = await api<WordDefinition>(
          `/api/aurora/dictionary/dictionary/${params.id}/word/${params.wordid}/`,
        )
        if (!data) setError(true)
        else setWord(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [params.id, params.wordid])

  useEffect(() => {
    const storedCompany = localStorage.getItem('Company-Name')
    if (storedCompany) setCompanyName(storedCompany)
  }, [])

  const sections = useMemo(() => {
    if (!word) return [] as Array<{ id: string; title: string; text: string }>
    const p1 = word.definition.paragraph_1
    const p2 = word.definition.paragraph_2
    const p3 = word.definition.paragraph_3

    return [
      p1 ? { id: 'definition', title: p1.title, text: clean(p1.text) } : null,
      p2 ? { id: 'why-it-matters', title: p2.title, text: clean(p2.text) } : null,
      p3 ? { id: 'best-practices', title: p3.title, text: clean(p3.text) } : null,
    ].filter(Boolean) as Array<{ id: string; title: string; text: string }>
  }, [word])

  const sharePost = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // no-op
    }
  }

  const def = word?.definition

  return (
    <div className="min-h-screen bg-background text-foreground [font-family:'Segoe_UI',SegoeUI,Segoe_UI_Web,Arial,sans-serif]">
      {showHeaderFooter && (
        <header className="h-20 border-b border-border bg-white">
          <div className="mx-auto flex h-full w-full max-w-[1280px] items-center px-6">
            <div className="mr-3 h-10 w-10 rounded-sm bg-primary" />
            <div className="text-xl font-semibold">{companyName} Glossary</div>
            <nav className="ml-auto hidden items-center gap-6 text-sm text-foreground md:flex">
              <span>Products</span>
              <span>About Us</span>
              <span>Support</span>
              <span>Contact</span>
            </nav>
          </div>
        </header>
      )}

      {/* Floating menu — same pattern as blog preview */}
      <Card className="fixed left-4 top-24 z-50 rounded border-border bg-white p-2 shadow-none">
        <CardContent className="flex flex-col gap-2 p-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dictionary/${params.id}/${params.wordid}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHeaderFooter((v) => !v)}
          >
            {showHeaderFooter ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
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
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}

            {!loading && error && (
              <Card className="mx-auto max-w-[720px] rounded border-border bg-white shadow-none">
                <CardContent className="p-8 text-center">
                  Failed to load preview.
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/dictionary/${params.id}/${params.wordid}`)
                      }
                    >
                      Go back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && !error && word && def && (
              <article className="mx-auto max-w-[720px]">
                <div className="mb-4 text-xs text-muted-foreground">
                  Home / Glossary / {word.keyword}
                </div>

                <h1 className="mb-6 text-4xl font-semibold leading-tight">
                  {word.keyword}
                </h1>

                {/* Featured snippet */}
                <Card className="mb-8 border-border bg-white">
                  <CardContent className="pt-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Quick answer
                    </p>
                    <p className="mt-2 text-base leading-7 text-foreground">
                      {clean(def.featured_google_snippet)}
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-8">
                  {sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-24 space-y-2"
                    >
                      <h2 className="text-2xl font-semibold">{section.title}</h2>
                      <p className="whitespace-pre-line text-[15px] leading-8 text-muted-foreground">
                        {section.text}
                      </p>
                    </section>
                  ))}

                  {/* Synonyms & Antonyms */}
                  <section id="synonyms" className="scroll-mt-24 space-y-3">
                    <h2 className="text-2xl font-semibold">Synonyms & Antonyms</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Card className="border-border bg-white">
                        <CardContent className="pt-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Synonyms
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(def.synonyms || []).map((s) => (
                              <Badge key={s} variant="outline">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-border bg-white">
                        <CardContent className="pt-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Antonyms
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(def.antonyms || []).map((s) => (
                              <Badge key={s} variant="outline">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  {/* Usage Examples */}
                  <section id="examples" className="scroll-mt-24 space-y-2">
                    <h2 className="text-2xl font-semibold">Usage Examples</h2>
                    <ul className="list-disc space-y-1 pl-5 text-[15px] leading-7 text-muted-foreground">
                      {(def.usage_examples || []).map((example, i) => (
                        <li key={i}>{example}</li>
                      ))}
                    </ul>
                  </section>

                  {/* Related Keywords */}
                  <section id="related" className="scroll-mt-24 space-y-2">
                    <h2 className="text-2xl font-semibold">Related Terms</h2>
                    <div className="flex flex-wrap gap-2">
                      {(def.related_keywords || []).map((k) => (
                        <Badge key={k} variant="secondary">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* FAQs */}
                  <section id="faqs" className="scroll-mt-24 space-y-2">
                    <h2 className="text-2xl font-semibold">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-2">
                      {(def.faqs || []).map((faq, i) => (
                        <details
                          key={i}
                          className="rounded-sm border border-border bg-white p-4"
                        >
                          <summary className="cursor-pointer text-sm font-medium">
                            {faq.question}
                          </summary>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {faq.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </section>
                </div>
              </article>
            )}
          </section>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 space-y-4">
              {/* On this page */}
              <Card className="rounded border-border shadow-none">
                <CardContent className="space-y-1 p-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    On this page
                  </p>
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {s.title}
                    </a>
                  ))}
                  <a
                    href="#synonyms"
                    className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Synonyms & Antonyms
                  </a>
                  <a
                    href="#examples"
                    className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Usage Examples
                  </a>
                  <a
                    href="#related"
                    className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Related Terms
                  </a>
                  <a
                    href="#faqs"
                    className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    FAQs
                  </a>
                </CardContent>
              </Card>

              {/* Related terms from definition */}
              {def && (def.related_keywords || []).length > 0 && (
                <Card className="rounded border-border shadow-none">
                  <CardContent className="space-y-2 p-4">
                    <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                      <BookOpen className="h-4 w-4 text-primary" /> Related Terms
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(def.related_keywords || []).slice(0, 10).map((k) => (
                        <Badge key={k} variant="outline" className="rounded-sm">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search (decorative) */}
              <Card className="rounded border-border shadow-none">
                <CardContent className="space-y-4 p-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold">Search Glossary</p>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-8" placeholder="Search terms..." />
                    </div>
                  </div>

                  <div className="rounded border border-border p-3">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Mail className="h-4 w-4 text-primary" /> Newsletter
                    </p>
                    <Input placeholder="Enter your email" />
                    <Button className="mt-2 h-8 w-full rounded-sm bg-primary hover:bg-primary-hover">
                      Subscribe
                    </Button>
                  </div>

                  {def && (def.synonyms || []).length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Tag className="h-4 w-4 text-primary" /> Synonyms
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(def.synonyms || []).slice(0, 8).map((s) => (
                          <Badge key={s} variant="outline" className="rounded-sm">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
              <p className="text-sm text-muted-foreground">
                A preview-only footer to simulate a real public website around
                this glossary term.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Home</li>
                <li>Products</li>
                <li>Services</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>FAQ</li>
                <li>Glossary</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>123 Preview St.</li>
                <li>fake@example.com</li>
                <li>(555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
            (Preview Mode)
          </div>
        </footer>
      )}
    </div>
  )
}
