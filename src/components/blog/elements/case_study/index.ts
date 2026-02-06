import { registerElement } from '../registry'
import { CaseStudy } from './CaseStudy'
import { CaseStudyPreview } from './CaseStudyPreview'
import { CaseStudyLoading } from './CaseStudyLoading'
import { caseStudyEditSchema } from './edit_schema'
import { caseStudyExample } from './example'

registerElement('case_study', {
  component: CaseStudy,
  preview: CaseStudyPreview,
  loading: CaseStudyLoading,
  editSchema: caseStudyEditSchema,
  example: caseStudyExample,
})

export { CaseStudy }
export { CaseStudyPreview }
export { CaseStudyLoading }
export { caseStudyEditSchema }
export { caseStudyExample }
