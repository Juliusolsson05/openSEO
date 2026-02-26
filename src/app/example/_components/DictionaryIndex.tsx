'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { ExampleDictionary } from '../_lib/types'

type Props = { dictionary: ExampleDictionary }

export function DictionaryIndex({ dictionary }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? dictionary.words.filter(
        (w) =>
          w.keyword.toLowerCase().includes(query.toLowerCase()) ||
          w.definition.featured_snippet.toLowerCase().includes(query.toLowerCase()),
      )
    : dictionary.words

  const grouped: Record<string, typeof filtered> = {}
  for (const word of filtered) {
    const letter = word.keyword[0].toUpperCase()
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(word)
  }
  const letters = Object.keys(grouped).sort()

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-blue-600">Glossary</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-neutral-900">
          {dictionary.name}
        </h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          {dictionary.description}
        </p>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms..."
          className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
        />
      </div>

      {/* Letter quick-jump */}
      <div className="mb-8 flex flex-wrap gap-1.5">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      {letters.length === 0 && (
        <p className="py-12 text-center text-[14px] text-neutral-400">
          No terms match &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="space-y-8">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      colSpan={2}
                      className="px-4 py-2.5 text-left text-[18px] font-bold"
                      style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb' }}
                    >
                      {letter}
                    </th>
                  </tr>
                  <tr className="border-b border-neutral-200" style={{ background: '#fafafa' }}>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400 w-[200px]">
                      Term
                    </th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Definition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[letter]
                    .sort((a, b) => a.keyword.localeCompare(b.keyword))
                    .map((word, i) => (
                      <tr
                        key={word.id}
                        className="border-b border-neutral-100 last:border-b-0 transition-colors hover:bg-blue-50/40"
                        style={{ background: i % 2 === 1 ? '#f9fafb' : '#ffffff' }}
                      >
                        <td className="px-4 py-3 align-top">
                          <Link
                            href={`/example/dictionary/${word.id}`}
                            className="text-[14px] font-semibold text-blue-600 hover:underline"
                          >
                            {word.keyword}
                          </Link>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-[13px] text-neutral-600 leading-relaxed line-clamp-2">
                            {word.definition.featured_snippet}
                          </p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-[12px] text-neutral-400">
          {filtered.length} term{filtered.length !== 1 ? 's' : ''}{query.trim() ? ' found' : ' in this glossary'}
        </p>
      </div>
    </div>
  )
}
