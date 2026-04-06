import type { ComponentType } from 'react'
import type { ElementType, EditSchema } from './types'
import type { ElementDocs } from './docs-types'
import { DefaultComponent, DefaultLoading, DefaultPreview } from './DefaultComponent'

// Component props that every element receives
export interface ElementComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  blogId: number
  elementId: number
  postTitle?: string
  imageNumber?: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hyperlink?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onContentUpdated?: (content: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onElementAdded?: (element: any) => void
  onElementDeleted?: (elementId: number) => void
}

export interface PreviewComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  blogId?: number
  elementId?: number
  postTitle?: string
  imageNumber?: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hyperlink?: any
  companyName?: string
  isCoverImage?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements?: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// ─── Component registries ────────────────────────────────────────────

const componentRegistry: Partial<Record<ElementType, ComponentType<ElementComponentProps>>> = {}
const previewRegistry: Partial<Record<ElementType, ComponentType<PreviewComponentProps>>> = {}
const loadingRegistry: Partial<Record<ElementType, ComponentType>> = {}
const editSchemaRegistry: Partial<Record<ElementType, EditSchema>> = {}
const exampleRegistry: Partial<Record<ElementType, any>> = {}
const iconRegistry: Partial<Record<ElementType, ComponentType<{ width?: number | string; height?: number | string; className?: string }>>> = {}
const docsRegistry: Partial<Record<ElementType, ElementDocs>> = {}

// ─── Registration functions (used by each element module) ────────────

export function registerElement(
  type: ElementType,
  config: {
    component: ComponentType<ElementComponentProps>
    preview?: ComponentType<PreviewComponentProps>
    loading?: ComponentType
    editSchema?: EditSchema
    example?: any
    icon?: ComponentType<{ width?: number | string; height?: number | string; className?: string }>
    docs?: ElementDocs
  }
) {
  componentRegistry[type] = config.component
  if (config.preview) previewRegistry[type] = config.preview
  if (config.loading) loadingRegistry[type] = config.loading
  if (config.editSchema) editSchemaRegistry[type] = config.editSchema
  if (config.example) exampleRegistry[type] = config.example
  if (config.icon) iconRegistry[type] = config.icon
  if (config.docs) docsRegistry[type] = config.docs
}

// ─── Lookup functions ────────────────────────────────────────────────

function normalize(type: string): ElementType {
  return type.toLowerCase() as ElementType
}

export function getComponent(type: ElementType): ComponentType<ElementComponentProps> {
  const key = normalize(type)
  return (componentRegistry[key] as ComponentType<ElementComponentProps>) || (DefaultComponent as any)
}

export function getPreviewComponent(type: ElementType): ComponentType<PreviewComponentProps> {
  const key = normalize(type)
  return (previewRegistry[key] as ComponentType<PreviewComponentProps>) || (DefaultPreview as any)
}

export function getLoadingComponent(type: ElementType): ComponentType {
  return loadingRegistry[normalize(type)] || DefaultLoading
}

export function getEditSchema(type: ElementType): EditSchema | null {
  return editSchemaRegistry[normalize(type)] || null
}

export function getExample(type: ElementType): any | null {
  return exampleRegistry[normalize(type)] || null
}

export function getIcon(type: ElementType): ComponentType<{ width?: number | string; height?: number | string; className?: string }> | null {
  return iconRegistry[normalize(type)] || null
}

export function getDocsRegistry(): Partial<Record<ElementType, ElementDocs>> {
  return docsRegistry
}

// ─── Element renderer helper ─────────────────────────────────────────

export function getElementInfo(type: string) {
  const elementType = type as ElementType
  return {
    Component: getComponent(elementType),
    Preview: getPreviewComponent(elementType),
    Loading: getLoadingComponent(elementType),
    editSchema: getEditSchema(elementType),
    example: getExample(elementType),
    icon: getIcon(elementType),
  }
}
