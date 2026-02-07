import Link from 'next/link'
import { getDictionary } from '../_lib/data'

export default function ExampleDictionaryIndex() {
  const dictionary = getDictionary()

  // Group words by first letter
  const grouped: Record<string, typeof dictionary.words> = {}
  for (const word of dictionary.words) {
    const letter = word.keyword[0].toUpperCase()
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(word)
  }

  // Sort letters alphabetically
  const letters = Object.keys(grouped).sort()

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <div className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-blue-600">Glossary</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-neutral-900">
          {dictionary.name}
        </h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          {dictionary.description}
        </p>
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

      {/* Alphabetical tables */}
      <div className="space-y-8">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    colSpan={2}
                    className="rounded-t-md px-4 py-2.5 text-left text-[18px] font-bold"
                    style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb' }}
                  >
                    {letter}
                  </th>
                </tr>
                <tr className="border-b border-neutral-200">
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
                  .map((word) => (
                    <tr
                      key={word.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
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
        ))}
      </div>

      {/* Word count footer */}
      <div className="mt-10 text-center">
        <p className="text-[12px] text-neutral-400">
          {dictionary.words.length} terms in this glossary
        </p>
      </div>
    </div>
  )
}
