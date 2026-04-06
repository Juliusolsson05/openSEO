import { getAllElementDocs } from '@/components/blog/elements/docs-registry'
import { ContentGuideClient } from './ContentGuideClient'

export default function ContentGuidePage() {
  return <ContentGuideClient elementDocs={getAllElementDocs()} />
}
