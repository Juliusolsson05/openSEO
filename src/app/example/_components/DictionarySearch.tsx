'use client'

import { useMemo, useState } from 'react'

import type { ExampleWord } from '../_lib/types'
import { WordCard } from './WordCard'

type DictionarySearchProps = {
  words: ExampleWord[]
}

export function DictionarySearch({ words }: DictionarySearchProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return words
      .filter((word) => {
        if (!normalized) return true
        return (
          word.keyword.toLowerCase().includes(normalized) ||
          word.definition.featured_snippet.toLowerCase().includes(normalized)
        )
      })
      .sort((a, b) => a.keyword.localeCompare(b.keyword))
  }, [query, words])

  return (
    <div className="space-y-6">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search terms like API, CDN, latency..."
        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-600"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((word) => (
          <WordCard key={word.id} word={word} />
        ))}
      </div>

      {!filtered.length ? <p className="text-sm text-neutral-500">No terms match your search.</p> : null}
    </div>
  )
}
