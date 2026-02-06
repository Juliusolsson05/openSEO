'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function WordDetailPage() {
  const params = useParams<{ id: string; wordid: string }>()
  const [word, setWord] = useState<WordDefinition | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await api<WordDefinition>(`/api/aurora/dictionary/dictionary/${params.id}/word/${params.wordid}/`)
      if (error) return window.alert(error.message)
      setWord(data)
    }
    load()
  }, [params.id, params.wordid])

  const paragraphs = useMemo(() => {
    if (!word) return []
    return [word.definition.paragraph_1, word.definition.paragraph_2, word.definition.paragraph_3].filter(Boolean)
  }, [word])

  if (!word) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <Card className="rounded-sm border-[#E1E1E1] bg-white" style={{ fontSize: 13 }}>
      <CardHeader>
        <CardTitle className="text-[28px]">{word.keyword}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h2 className="font-semibold text-lg">{word.definition.title}</h2>
          <p className="mt-2 text-muted-foreground">{word.definition.featured_google_snippet}</p>
        </section>

        {paragraphs.map((p, i) => (
          <section key={i}>
            <h3 className="font-semibold">{p?.title}</h3>
            <p className="mt-1 text-muted-foreground">{p?.text}</p>
          </section>
        ))}

        <section>
          <h3 className="font-semibold mb-2">Synonyms & Antonyms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="rounded-sm border-[#E1E1E1]"><CardContent className="pt-4">{word.definition.synonyms.join(', ') || '—'}</CardContent></Card>
            <Card className="rounded-sm border-[#E1E1E1]"><CardContent className="pt-4">{word.definition.antonyms.join(', ') || '—'}</CardContent></Card>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Usage Examples</h3>
          <ul className="list-disc pl-5 space-y-1">
            {word.definition.usage_examples.map((example, i) => (
              <li key={i}>{example}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Related Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {word.definition.related_keywords.map((k) => (
              <Badge key={k} variant="outline" className="rounded-sm">{k}</Badge>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {word.definition.faqs.map((faq, i) => (
              <Card key={i} className="rounded-sm border-[#E1E1E1]">
                <CardContent className="pt-4">
                  <p className="font-medium">{faq.question}</p>
                  <p className="text-muted-foreground mt-1">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
