import { registerElement } from '../registry'
import { Glossary } from './Glossary'
import { GlossaryPreview } from './GlossaryPreview'
import { GlossaryLoading } from './GlossaryLoading'
import { glossaryEditSchema } from './edit_schema'
import { glossaryExample } from './example'
import GlossaryIcon from './Icon'

registerElement('glossary', {
  component: Glossary,
  preview: GlossaryPreview,
  loading: GlossaryLoading,
  editSchema: glossaryEditSchema,
  example: glossaryExample,
  icon: GlossaryIcon,
})

export { Glossary, GlossaryPreview, GlossaryLoading, glossaryEditSchema, glossaryExample }
