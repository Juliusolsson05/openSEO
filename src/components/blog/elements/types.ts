// All element types in the system
export type ElementType =
  | 'paragraph'
  | 'introduction'
  | 'conclusion'
  | 'list_paragraph'
  | 'numbered_list_paragraph'
  | 'table'
  | 'faq'
  | 'quote'
  | 'checklist'
  | 'statistic'
  | 'pros_and_cons'
  | 'versus'
  | 'timeline'
  | 'bar_chart'
  | 'code_cluster'
  | 'featured_snippet_block'
  | 'list_featured_snippet_block'
  | 'case_study'
  | 'tool_recommendation'
  | 'product_recommendations'
  | 'call_to_action'
  | 'image'
  | 'glossary'
  | 'context'
  | 'poll'
  | 'quiz'
  | 'interactive_calculator'
  | 'affiliate_recommendations'
  | 'form'
  | 'cta'

// Element types available for generation
export const GENERATE_ELEMENT_TYPES: ElementType[] = [
  'paragraph', 'list_paragraph', 'numbered_list_paragraph', 'image',
  'quote', 'featured_snippet_block', 'faq', 'conclusion', 'call_to_action',
  'list_featured_snippet_block', 'glossary', 'versus', 'table', 'pros_and_cons',
  'case_study', 'checklist', 'statistic', 'timeline', 'bar_chart', 'tool_recommendation',
]

// Edit field type definitions
export type EditFieldType =
  | 'text'
  | 'textarea'
  | 'rich-text'
  | 'select'
  | 'color'
  | 'number'
  | 'array'
  | 'object'
  | 'dynamic-table'
  | 'nested-array'
  | 'array-object'
  | 'pros-cons'
  | 'url'
  | 'versus'
  | 'percentage'
  | 'faq'
  | 'table'

export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'minItems' | 'maxItems' | 'pattern' | 'url' | 'hexColor'
  message: string
  value?: any
}

export interface EditField {
  type: EditFieldType
  label: string
  required?: boolean
  description?: string
  validation?: ValidationRule[]
  minItems?: number
  maxItems?: number
  placeholder?: string
  defaultValue?: any
  fields?: Record<string, EditField>
  itemConfig?: EditField
  options?: Array<{ label: string; value: any }>
  poolField?: { keys: string[]; field: EditField }
  passthrough?: boolean
}

export interface EditSchema {
  title: string
  fields: Record<string, EditField | { poolField: { keys: string[]; field: EditField } }>
}

// Field factory helpers
export const TextField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'text', label, ...opts,
})

export const TextAreaField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'textarea', label, ...opts,
})

export const RichTextField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'rich-text', label, ...opts,
})

export const SelectField = (
  label: string,
  options: Array<{ label: string; value: any }>,
  opts: Partial<EditField> = {}
): EditField => ({ type: 'select', label, options, ...opts })

export const ColorField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'color', label,
  validation: [{ type: 'hexColor', message: 'Must be a valid hex color code' }, ...(opts.validation || [])],
  ...opts,
})

export const NumberField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'number', label, ...opts,
})

export const ArrayField = (label: string, itemConfig: EditField, opts: Partial<EditField> = {}): EditField => ({
  type: 'array', label, itemConfig, ...opts,
})

export const ObjectField = (label: string, fields: Record<string, EditField>, opts: Partial<EditField> = {}): EditField => ({
  type: 'object', label, fields, ...opts,
})

export const TableEditField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'table', label, ...opts,
})

export const DynamicTableField = (
  label: string,
  columns: Array<{ key: string; label: string; type: EditFieldType }>,
  opts: Partial<EditField> = {}
): EditField => ({
  type: 'dynamic-table', label,
  fields: Object.fromEntries(columns.map((col) => [col.key, { type: col.type, label: col.label } as EditField])),
  ...opts,
})

export const NestedArrayField = (label: string, fields: Record<string, EditField>, opts: Partial<EditField> = {}): EditField => ({
  type: 'nested-array', label, fields, ...opts,
})

export const URLField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'url', label,
  validation: [{ type: 'url', message: 'Must be a valid URL' }, ...(opts.validation || [])],
  ...opts,
})

export const PercentageField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'percentage', label,
  validation: [
    { type: 'min', value: 0, message: 'Percentage must be at least 0' },
    { type: 'max', value: 100, message: 'Percentage must be at most 100' },
    ...(opts.validation || []),
  ],
  ...opts,
})

export const ArrayObjectField = (label: string, fields: Record<string, EditField>, opts: Partial<EditField> = {}): EditField => ({
  type: 'array-object', label, fields, ...opts,
})

export const VersusEditField = (label: string, fields: Record<string, EditField>, opts: Partial<EditField> = {}): EditField => ({
  type: 'versus', label, fields, ...opts,
})

export const ProsConsField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'pros-cons', label,
  fields: {
    pros: ArrayField('Pros', TextField('Pro'), { minItems: 1, maxItems: 10 }),
    cons: ArrayField('Cons', TextField('Con'), { minItems: 1, maxItems: 10 }),
  },
  ...opts,
})

export const FaqEditField = (label: string, opts: Partial<EditField> = {}): EditField => ({
  type: 'faq', label, ...opts,
})
