import { SiteDictionaryIndex } from '@/app/site/_components/SiteDictionaryIndex'
import { getDictionary } from '@/server/public-content/data'

export default async function SiteDictionaryPage() {
  const dictionary = await getDictionary()
  return <SiteDictionaryIndex dictionary={dictionary} />
}
