import { getDictionary } from '../_lib/data'
import { DictionaryIndex } from '../_components/DictionaryIndex'

export const dynamic = 'force-dynamic'

export default async function ExampleDictionaryPage() {
  const dictionary = await getDictionary()
  return <DictionaryIndex dictionary={dictionary} />
}
