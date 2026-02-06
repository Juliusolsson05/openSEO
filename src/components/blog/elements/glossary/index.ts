import { registerElement } from '../registry'
import { Glossary } from './Glossary'
import { GlossaryPreview } from './GlossaryPreview'
import { GlossaryLoading } from './GlossaryLoading'
import { glossaryEditSchema } from './edit_schema'
import { glossaryExample } from './example'

registerElement('glossary', {
  component: Glossary,
  preview: GlossaryPreview,
  loading: GlossaryLoading,
  editSchema: glossaryEditSchema,
  example: glossaryExample,
})

export { Glossary, GlossaryPreview, GlossaryLoading, glossaryEditSchema, glossaryExample }
