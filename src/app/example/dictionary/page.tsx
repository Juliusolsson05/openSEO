import { DictionarySearch } from '../_components/DictionarySearch'
import { getDictionary } from '../_lib/data'

export default function ExampleDictionaryPage() {
  const dictionary = getDictionary()

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-16">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Glossary</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900">Dictionary</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-neutral-600">{dictionary.description}</p>
      </header>

      <DictionarySearch words={dictionary.words} />
    </div>
  )
}
