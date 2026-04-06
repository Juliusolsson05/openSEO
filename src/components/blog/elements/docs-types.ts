export interface ElementFieldDoc {
  name: string
  type: string
  required?: boolean
  description: string
}

export interface ElementDocs {
  label: string
  description: string
  fields: ElementFieldDoc[]
  example: Record<string, unknown>
  hyperlinkFields?: string[]
  legacyNotes?: string
}
