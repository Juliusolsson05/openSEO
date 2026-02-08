import type { ComparisonElementData, ComparisonToolData } from '../_lib/types'
import { Introduction } from './elements/Introduction'
import { VerdictCard } from './elements/VerdictCard'
import { OverviewTable } from './elements/OverviewTable'
import { FeatureComparison } from './elements/FeatureComparison'
import { PricingComparison } from './elements/PricingComparison'
import { ProsConsGrid } from './elements/ProsConsGrid'
import { Paragraph } from './elements/Paragraph'
import { FAQ } from './elements/FAQ'
import { ScoreSummary } from './elements/ScoreSummary'
import { AuroraCTA } from './elements/AuroraCTA'

interface Props {
  element: ComparisonElementData
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function ComparisonElementRenderer({ element, toolA, toolB }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = element.content as any

  switch (element.element_type) {
    case 'introduction':
      return <Introduction content={content} />
    case 'verdict':
      return <VerdictCard content={content} toolA={toolA} toolB={toolB} />
    case 'overview_table':
      return <OverviewTable content={content} toolA={toolA} toolB={toolB} />
    case 'feature_comparison':
      return <FeatureComparison content={content} toolA={toolA} toolB={toolB} />
    case 'pricing_comparison':
      return <PricingComparison content={content} toolA={toolA} toolB={toolB} />
    case 'pros_cons':
      return <ProsConsGrid content={content} toolA={toolA} toolB={toolB} />
    case 'paragraph':
      return <Paragraph content={content} />
    case 'faq':
      return <FAQ content={content} />
    case 'score_summary':
      return <ScoreSummary content={content} toolA={toolA} toolB={toolB} />
    case 'aurora_cta':
      return <AuroraCTA content={content} />
    default:
      return null
  }
}
