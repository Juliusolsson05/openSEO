import '@/components/blog/elements'

import { getDocsRegistry } from '@/components/blog/elements/registry'
import type { ElementDocs } from '@/components/blog/elements/docs-types'
import { GENERATE_ELEMENT_TYPES } from '@/components/blog/elements/types'
import { ContentGuideClient } from './ContentGuideClient'

export default function ContentGuidePage() {
  const registry = getDocsRegistry()

  const seen = new Set<string>()
  const elementDocs: Array<{ type: string; docs: ElementDocs }> = []

  for (const type of GENERATE_ELEMENT_TYPES) {
    const docs = registry[type]
    if (docs) {
      elementDocs.push({ type, docs })
      seen.add(type)
    }
  }

  for (const [type, docs] of Object.entries(registry)) {
    if (!seen.has(type) && docs) {
      elementDocs.push({ type, docs })
    }
  }

  return <ContentGuideClient elementDocs={elementDocs} />
}
