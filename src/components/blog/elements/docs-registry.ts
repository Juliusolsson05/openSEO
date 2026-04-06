import type { ElementDocs } from './docs-types'
import { GENERATE_ELEMENT_TYPES } from './types'

import { paragraphDocs } from './paragraph/docs'
import { introductionDocs } from './introduction/docs'
import { conclusionDocs } from './conclusion/docs'
import { faqDocs } from './faq/docs'
import { listParagraphDocs } from './list_paragraph/docs'
import { numberedListParagraphDocs } from './numbered_list_paragraph/docs'
import { tableDocs } from './table/docs'
import { quoteDocs } from './quote/docs'
import { checklistDocs } from './checklist/docs'
import { statisticDocs } from './statistic/docs'
import { barChartDocs } from './bar_chart/docs'
import { prosAndConsDocs } from './pros_and_cons/docs'
import { versusDocs } from './versus/docs'
import { timelineDocs } from './timeline/docs'
import { caseStudyDocs } from './case_study/docs'
import { toolRecommendationDocs } from './tool_recommendation/docs'
import { callToActionDocs } from './call_to_action/docs'
import { imageDocs } from './image/docs'
import { glossaryDocs } from './glossary/docs'
import { codeClusterDocs } from './code_cluster/docs'
import { productRecommendationsDocs } from './product_recommendations/docs'
import { snippetBlockDocs } from './snippet_block/docs'

const ALL_DOCS: Record<string, ElementDocs> = {
  paragraph: paragraphDocs,
  introduction: introductionDocs,
  conclusion: conclusionDocs,
  faq: faqDocs,
  list_paragraph: listParagraphDocs,
  numbered_list_paragraph: numberedListParagraphDocs,
  table: tableDocs,
  quote: quoteDocs,
  checklist: checklistDocs,
  statistic: statisticDocs,
  bar_chart: barChartDocs,
  pros_and_cons: prosAndConsDocs,
  versus: versusDocs,
  timeline: timelineDocs,
  case_study: caseStudyDocs,
  tool_recommendation: toolRecommendationDocs,
  call_to_action: callToActionDocs,
  image: imageDocs,
  glossary: glossaryDocs,
  code_cluster: codeClusterDocs,
  product_recommendations: productRecommendationsDocs,
  featured_snippet_block: snippetBlockDocs,
}

export function getAllElementDocs(): Array<{ type: string; docs: ElementDocs }> {
  const seen = new Set<string>()
  const result: Array<{ type: string; docs: ElementDocs }> = []

  for (const type of GENERATE_ELEMENT_TYPES) {
    const docs = ALL_DOCS[type]
    if (docs) {
      result.push({ type, docs })
      seen.add(type)
    }
  }

  for (const [type, docs] of Object.entries(ALL_DOCS)) {
    if (!seen.has(type)) {
      result.push({ type, docs })
    }
  }

  return result
}
