'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface FAQ {
  question: string
  answer: string
}

interface Definition {
  title: string
  featured_google_snippet: string
  paragraph_1?: { title: string; text: string }
  paragraph_2?: { title: string; text: string }
  paragraph_3?: { title: string; text: string }
  synonyms: string[]
  antonyms: string[]
  usage_examples: string[]
  related_keywords: string[]
  faqs: FAQ[]
}

interface WordDefinition {
  keyword: string
  definition: Definition
}

const clean = (value?: string) => (value || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim()

export default function DictionaryPublicPreviewPage() {
  const params = useParams<{ id: string; wordid: string }>()
  const [word, setWord] = useState<WordDefinition | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await api<WordDefinition>(`/api/aurora/dictionary/dictionary/${params.id}/word/${params.wordid}/`)
      if (error) return
      setWord(data)
    }
    void load()
  }, [params.id, params.wordid])

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

  if (!word) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  const def = word.definition

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_260px]">
        <article className="mx-auto w-full max-w-3xl space-y-8">
          <header className="space-y-3">
            <p className="text-sm text-muted-foreground">Home / Glossary / {word.keyword}</p>
            <h1 className="text-4xl font-semibold tracking-tight">{word.keyword}</h1>

            <Card className="border-border bg-white">
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Quick answer</p>
                <p className="mt-2 text-base leading-7 text-foreground">{clean(def.featured_google_snippet)}</p>
              </CardContent>
            </Card>
          </header>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-2">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="whitespace-pre-line text-[15px] leading-8 text-muted-foreground">{section.text}</p>
            </section>
          ))}

          <section id="synonyms" className="space-y-3">
            <h2 className="text-2xl font-semibold">Synonyms & Antonyms</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Card className="border-border bg-white"><CardContent className="pt-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Synonyms</p><div className="mt-2 flex flex-wrap gap-2">{(def.synonyms || []).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div></CardContent></Card>
              <Card className="border-border bg-white"><CardContent className="pt-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Antonyms</p><div className="mt-2 flex flex-wrap gap-2">{(def.antonyms || []).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div></CardContent></Card>
            </div>
          </section>

          <section id="examples" className="space-y-2">
            <h2 className="text-2xl font-semibold">Usage Examples</h2>
            <ul className="list-disc space-y-1 pl-5 text-[15px] leading-7 text-muted-foreground">
              {(def.usage_examples || []).map((example, i) => <li key={i}>{example}</li>)}
            </ul>
          </section>

          <section id="related" className="space-y-2">
            <h2 className="text-2xl font-semibold">Related Terms</h2>
            <div className="flex flex-wrap gap-2">
              {(def.related_keywords || []).map((k) => <Badge key={k} variant="secondary">{k}</Badge>)}
            </div>
          </section>

          <section id="faqs" className="space-y-2">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {(def.faqs || []).map((faq, i) => (
                <details key={i} className="rounded-sm border border-border bg-white p-4">
                  <summary className="cursor-pointer text-sm font-medium">{faq.question}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-sm border border-border bg-white p-4 text-sm">
            Explore more terms in your glossary.
            <div className="mt-2">
              <Link href="/dictionary" className="text-primary hover:underline">Back to dictionary</Link>
            </div>
          </div>
        </article>

        <aside className="space-y-2 lg:sticky lg:top-8 lg:h-fit">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">On this page</p>
          {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="block text-sm text-muted-foreground hover:text-foreground hover:underline">{s.title}</a>)}
          <a href="#synonyms" className="block text-sm text-muted-foreground hover:text-foreground hover:underline">Synonyms & Antonyms</a>
          <a href="#examples" className="block text-sm text-muted-foreground hover:text-foreground hover:underline">Usage examples</a>
          <a href="#related" className="block text-sm text-muted-foreground hover:text-foreground hover:underline">Related terms</a>
          <a href="#faqs" className="block text-sm text-muted-foreground hover:text-foreground hover:underline">FAQs</a>
        </aside>
      </div>
    </div>
  )
}
