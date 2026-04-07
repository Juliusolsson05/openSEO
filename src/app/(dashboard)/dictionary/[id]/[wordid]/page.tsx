'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useWordDefinitionQuery } from '@/hooks/queries/dictionary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import type { DashboardDefinition as Definition, DashboardWord as WordDefinition } from '@/types/dictionary'

const clean = (value?: string) => {
  let s = (value || '').replace(/<br\s*\/?>/gi, '\n')
  let prev = ''
  while (s !== prev) { prev = s; s = s.replace(/<[^>]*>/g, '') }
  return s.trim()
}

export default function WordDetailPage() {
  const params = useParams<{ id: string; wordid: string }>()
  const { data: word } = useWordDefinitionQuery(params.id, params.wordid)

  const sections = useMemo(() => {
    if (!word) return [] as Array<{ id: string; title: string; text: string }>
    const p1 = word.definition.paragraph_1
    const p2 = word.definition.paragraph_2
    const p3 = word.definition.paragraph_3
    return [
      p1 ? { id: 'section-1', title: p1.title, text: clean(p1.text) } : null,
      p2 ? { id: 'section-2', title: p2.title, text: clean(p2.text) } : null,
      p3 ? { id: 'section-3', title: p3.title, text: clean(p3.text) } : null,
    ].filter(Boolean) as Array<{ id: string; title: string; text: string }>
  }, [word])

  if (!word) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const def = word.definition

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <Card className="rounded-sm border-border bg-white">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Definition Workspace</p>
                <CardTitle className="text-[30px] leading-tight">{word.keyword}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge variant="warning">Draft</Badge>
                <Badge variant="outline">SEO</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <section id="featured-snippet" className="rounded-sm border border-border bg-secondary/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Featured Snippet</p>
              <h2 className="mt-1 text-xl font-semibold">{def.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{clean(def.featured_google_snippet)}</p>
            </section>

            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{section.text}</p>
              </section>
            ))}

            <section id="synonyms-antonyms" className="space-y-3">
              <h3 className="text-lg font-semibold">Synonyms & Antonyms</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Card className="rounded-sm border-border">
                  <CardContent className="pt-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Synonyms</p>
                    <div className="flex flex-wrap gap-2">
                      {(def.synonyms || []).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-sm border-border">
                  <CardContent className="pt-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Antonyms</p>
                    <div className="flex flex-wrap gap-2">
                      {(def.antonyms || []).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="usage-examples" className="space-y-2">
              <h3 className="text-lg font-semibold">Usage Examples</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {(def.usage_examples || []).map((example, i) => <li key={i}>{example}</li>)}
              </ul>
            </section>

            <section id="related-keywords" className="space-y-2">
              <h3 className="text-lg font-semibold">Related Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {(def.related_keywords || []).map((k) => <Badge key={k} variant="outline">{k}</Badge>)}
              </div>
            </section>

            <section id="faqs" className="space-y-2">
              <h3 className="text-lg font-semibold">FAQs</h3>
              <div className="space-y-2">
                {(def.faqs || []).map((faq, i) => (
                  <details key={i} className="rounded-sm border border-border bg-white p-3">
                    <summary className="cursor-pointer text-sm font-medium">{faq.question}</summary>
                    <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 lg:sticky lg:top-16 lg:h-fit">
        <Card className="rounded-sm border-border bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Has snippet</span><Badge variant="success">Yes</Badge></div>
            <div className="flex items-center justify-between"><span>Has 3 sections</span><Badge variant={sections.length >= 3 ? 'success' : 'warning'}>{sections.length >= 3 ? 'Yes' : 'No'}</Badge></div>
            <div className="flex items-center justify-between"><span>Has FAQs</span><Badge variant={(def.faqs || []).length ? 'success' : 'warning'}>{(def.faqs || []).length ? 'Yes' : 'No'}</Badge></div>
            <div className="flex items-center justify-between"><span>Meta description</span><Badge variant={def.meta_description ? 'success' : 'warning'}>{def.meta_description ? 'Yes' : 'No'}</Badge></div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-border bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">On this page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <a href="#featured-snippet" className="block hover:underline">Featured snippet</a>
            {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="block hover:underline">{s.title}</a>)}
            <a href="#synonyms-antonyms" className="block hover:underline">Synonyms & Antonyms</a>
            <a href="#usage-examples" className="block hover:underline">Usage examples</a>
            <a href="#related-keywords" className="block hover:underline">Related keywords</a>
            <a href="#faqs" className="block hover:underline">FAQs</a>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-border bg-white">
          <CardContent className="pt-4">
            <Link href={`/preview/dictionary/${params.id}/${params.wordid}`}>
              <Button className="w-full rounded-sm">Open Public Preview</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
