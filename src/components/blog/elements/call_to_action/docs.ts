import type { ElementDocs } from '../docs-types'
import { callToActionExample } from './example'

export const callToActionDocs: ElementDocs = {
  label: 'Call to Action',
  description: 'CTA block with button and optional image.',
  fields: [
    { name: 'title', type: 'string', description: 'CTA heading.' },
    { name: 'description', type: 'string', description: 'CTA body text.' },
    { name: 'button_label', type: 'string', description: 'Button text.' },
    { name: 'button_href', type: 'string', description: 'Button link URL.' },
    { name: 'target_url', type: 'string', description: 'Alias for button_href (legacy).' },
    { name: 'link', type: 'string', description: 'Alias for button_href (legacy).' },
    { name: 'image_url', type: 'string', description: 'Optional banner image.' },
    { name: 'image', type: 'string', description: 'Alias for image_url (legacy).' },
  ],
  example: callToActionExample,
  legacyNotes: 'Prefer button_href and image_url. Fall back to target_url ?? link and image_url ?? image for older content.',
}
