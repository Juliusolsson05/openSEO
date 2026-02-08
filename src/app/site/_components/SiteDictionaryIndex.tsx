'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { PublicDictionary } from '@/server/public-content/types'

export function SiteDictionaryIndex({ dictionary }: { dictionary: PublicDictionary }) {
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
      <p className="text-[12px] font-semibold uppercase tracking-widest text-blue-600">Dictionary</p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-neutral-900">{dictionary.name}</h1>
      <p className="mt-1 text-[14px] text-neutral-500">{dictionary.description}</p>

      <div className="relative mt-6 mb-8 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms..."
          className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 text-[13px] text-neutral-900"
        />
      </div>

      <div className="space-y-8">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`}>
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th colSpan={2} className="px-4 py-2.5 text-left text-[18px] font-bold bg-blue-50 text-blue-600">{letter}</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[letter]
                    .sort((a, b) => a.keyword.localeCompare(b.keyword))
                    .map((word) => (
                      <tr key={word.id} className="border-t border-neutral-100">
                        <td className="px-4 py-3 align-top w-[230px]">
                          <Link href={`/site/dictionary/${word.id}`} className="text-[14px] font-semibold text-blue-600 hover:underline">
                            {word.keyword}
                          </Link>
                        </td>
                        <td className="px-4 py-3 align-top text-[13px] text-neutral-600 line-clamp-2">
                          {word.definition.featured_snippet}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
