import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WordRenderer } from '../../_components/WordRenderer'
import { getDictionary, getWord } from '../../_lib/data'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ wordId: string }>
}

export default async function ExampleDictionaryWordPage({ params }: PageProps) {
  const { wordId } = await params
  const word = await getWord(wordId)

  if (!word) notFound()

  const dictionary = await getDictionary()
  const related = dictionary.words.filter((item) => item.id !== word.id).slice(0, 5)

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/example" className="hover:text-blue-600">Home</Link> /{' '}
        <Link href="/example/dictionary" className="hover:text-blue-600">Dictionary</Link> /{' '}
        <span className="text-neutral-700">{word.keyword}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <WordRenderer word={word} />

        <aside className="space-y-6">
          <div className="rounded-xl border border-neutral-200 p-4">
            <h2 className="text-sm font-semibold text-neutral-900">On this page</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li><a href="#" className="hover:text-blue-600">Overview</a></li>
              <li><a href="#" className="hover:text-blue-600">Usage examples</a></li>
              <li><a href="#" className="hover:text-blue-600">Synonyms & antonyms</a></li>
              <li><a href="#" className="hover:text-blue-600">FAQs</a></li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <h2 className="text-sm font-semibold text-neutral-900">Related terms</h2>
            <ul className="mt-3 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={`/example/dictionary/${item.id}`} className="text-sm text-neutral-600 hover:text-blue-600">
                    {item.keyword}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
