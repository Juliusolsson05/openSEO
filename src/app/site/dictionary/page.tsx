import { DictionaryIndex } from '@/app/example/_components/DictionaryIndex'
import { getDictionary } from '@/server/public-content/data'

export default async function SiteDictionaryPage() {
  const dictionary = await getDictionary()
  return <DictionaryIndex dictionary={dictionary} />
}
