import Link from 'next/link'

import type { ExampleWord } from '../_lib/types'

type WordCardProps = {
  word: ExampleWord
}

export function WordCard({ word }: WordCardProps) {
  return (
    <Link href={`/example/dictionary/${word.id}`} className="block rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900">{word.keyword}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{word.definition.featured_snippet}</p>
    </Link>
  )
}
