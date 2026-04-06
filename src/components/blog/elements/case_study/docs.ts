import type { ElementDocs } from '../docs-types'
import { caseStudyExample } from './example'

export const caseStudyDocs: ElementDocs = {
  label: 'Case Study',
  description: 'Client success story with challenge/solution/results.',
  fields: [
    { name: 'title', type: 'string', required: true, description: 'Case study title.' },
    { name: 'clientName', type: 'string', description: 'Client or company name.' },
    { name: 'industry', type: 'string', description: 'Industry vertical.' },
    { name: 'companyWebsite', type: 'string', description: 'Client website URL.' },
    { name: 'headerColor', type: 'string', description: 'Hex color for the header.' },
    { name: 'challenge', type: 'string', description: 'The problem that was solved.' },
    { name: 'solution', type: 'string', description: 'How it was solved.' },
    { name: 'results', type: 'string[]', description: 'Key outcome bullet points.' },
    { name: 'testimonial', type: '{quote, author}', description: 'Optional client quote.' },
  ],
  example: caseStudyExample,
  hyperlinkFields: ['title', 'clientName', 'industry', 'challenge', 'solution', 'results'],
}
