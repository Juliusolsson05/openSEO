import { notFound } from 'next/navigation'
import { SiteDictionaryIndex } from '@/app/site/_components/SiteDictionaryIndex'
import { getDictionary } from '@/server/public-content/data'
import { resolvePublicCompanyId } from '@/server/public-content/company'

export const dynamic = 'force-dynamic'

export default async function SiteDictionaryPage() {
  const companyId = resolvePublicCompanyId()
  if (companyId === null) notFound()
  const dictionary = await getDictionary(companyId)
  return <SiteDictionaryIndex dictionary={dictionary} />
}
