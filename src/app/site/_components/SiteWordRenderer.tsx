import type { PublicWord } from '@/server/public-content/types'

export function SiteWordRenderer({ word }: { word: PublicWord }) {
  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-[34px] font-semibold tracking-tight text-neutral-900">{word.keyword}</h1>
        <p className="mt-3 text-[17px] leading-8 text-neutral-700">{word.definition.featured_snippet}</p>
      </header>

      <section>
        <h2 className="text-[22px] font-semibold text-neutral-900">Definition</h2>
        <p className="mt-2 text-neutral-700 leading-7">{word.definition.paragraph_1 || word.definition.featured_snippet}</p>
        {word.definition.paragraph_2 ? <p className="mt-2 text-neutral-700 leading-7">{word.definition.paragraph_2}</p> : null}
        {word.definition.paragraph_3 ? <p className="mt-2 text-neutral-700 leading-7">{word.definition.paragraph_3}</p> : null}
      </section>

      {word.definition.usage_examples.length > 0 && (
        <section>
          <h2 className="text-[22px] font-semibold text-neutral-900">Usage examples</h2>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-neutral-700">
            {word.definition.usage_examples.map((ex, i) => <li key={i}>{ex}</li>)}
          </ul>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 p-4">
          <h3 className="text-[16px] font-semibold text-neutral-900">Synonyms</h3>
          <p className="mt-2 text-sm text-neutral-600">{word.definition.synonyms.join(', ') || '—'}</p>
        </section>
        <section className="rounded-lg border border-neutral-200 p-4">
          <h3 className="text-[16px] font-semibold text-neutral-900">Antonyms</h3>
          <p className="mt-2 text-sm text-neutral-600">{word.definition.antonyms.join(', ') || '—'}</p>
        </section>
      </div>
    </article>
  )
}
