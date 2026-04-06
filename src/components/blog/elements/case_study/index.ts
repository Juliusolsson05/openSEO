import { registerElement } from '../registry'
import { CaseStudy } from './CaseStudy'
import { CaseStudyPreview } from './CaseStudyPreview'
import { CaseStudyLoading } from './CaseStudyLoading'
import Icon from './Icon'
import { caseStudyEditSchema } from './edit_schema'
import { caseStudyExample } from './example'
import { caseStudyDocs } from './docs'

registerElement('case_study', {
  component: CaseStudy,
  preview: CaseStudyPreview,
  loading: CaseStudyLoading,
  icon: Icon,
  editSchema: caseStudyEditSchema,
  example: caseStudyExample,
  docs: caseStudyDocs,
})

export { CaseStudy }
export { CaseStudyPreview }
export { CaseStudyLoading }
export { caseStudyEditSchema }
export { caseStudyExample }
