import type { ExampleWord } from '../_lib/types'

type WordRendererProps = {
  word: ExampleWord
}

export function WordRenderer({ word }: WordRendererProps) {
  const { definition } = word

  return (
    <article className="space-y-8">
      <header className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Glossary term</p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">{word.keyword}</h1>
        <p className="text-[15px] leading-relaxed text-neutral-700">{definition.featured_snippet}</p>
      </header>

      <section className="space-y-4 text-[15px] leading-relaxed text-neutral-700">
        <p>{definition.paragraph_1}</p>
        <p>{definition.paragraph_2}</p>
        <p>{definition.paragraph_3}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900">Usage examples</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
          {definition.usage_examples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Synonyms</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {definition.synonyms.map((synonym) => (
              <span key={synonym} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                {synonym}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Antonyms</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {definition.antonyms.map((antonym) => (
              <span key={antonym} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                {antonym}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-900">FAQs</h2>
        <div className="mt-3 space-y-2">
          {definition.faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-neutral-200 p-4">
              <summary className="cursor-pointer text-sm font-medium text-neutral-900">{faq.question}</summary>
              <p className="mt-2 text-sm text-neutral-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  )
}
