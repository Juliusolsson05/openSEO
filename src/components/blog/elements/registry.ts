/**
 * Element registry — maps element_type strings to React components.
 * Ported from aurora_dashboard/views/apps/blog/elements/elements.ts
 *
 * Individual element components will be added by sub-agents.
 * Until then, all types fall back to DefaultComponent/DefaultPreview.
 */

import type { ComponentType } from 'react'
import type { ElementType, EditSchema } from './types'
import { DefaultComponent, DefaultLoading, DefaultPreview } from './DefaultComponent'

// Component props that every element receives
export interface ElementComponentProps {
  content: any
  blogId: number
  elementId: number
  onContentUpdated?: (content: any) => void
  onElementAdded?: (element: any) => void
  onElementDeleted?: (elementId: number) => void
}

export interface PreviewComponentProps {
  content: any
}

// ─── Component registries ────────────────────────────────────────────
// These will be populated as sub-agents port each element.

const componentRegistry: Partial<Record<ElementType, ComponentType<ElementComponentProps>>> = {}
const previewRegistry: Partial<Record<ElementType, ComponentType<PreviewComponentProps>>> = {}
const loadingRegistry: Partial<Record<ElementType, ComponentType>> = {}
const editSchemaRegistry: Partial<Record<ElementType, EditSchema>> = {}
const exampleRegistry: Partial<Record<ElementType, any>> = {}

// ─── Registration functions (used by each element module) ────────────

export function registerElement(
  type: ElementType,
  config: {
    component: ComponentType<ElementComponentProps>
    preview?: ComponentType<PreviewComponentProps>
    loading?: ComponentType
    editSchema?: EditSchema
    example?: any
  }
) {
  componentRegistry[type] = config.component
  if (config.preview) previewRegistry[type] = config.preview
  if (config.loading) loadingRegistry[type] = config.loading
  if (config.editSchema) editSchemaRegistry[type] = config.editSchema
  if (config.example) exampleRegistry[type] = config.example
}

// ─── Lookup functions ────────────────────────────────────────────────

export function getComponent(type: ElementType): ComponentType<ElementComponentProps> {
  return (componentRegistry[type] as ComponentType<ElementComponentProps>) || (DefaultComponent as any)
}

export function getPreviewComponent(type: ElementType): ComponentType<PreviewComponentProps> {
  return (previewRegistry[type] as ComponentType<PreviewComponentProps>) || (DefaultPreview as any)
}

export function getLoadingComponent(type: ElementType): ComponentType {
  return loadingRegistry[type] || DefaultLoading
}

export function getEditSchema(type: ElementType): EditSchema | null {
  return editSchemaRegistry[type] || null
}

export function getExample(type: ElementType): any | null {
  return exampleRegistry[type] || null
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
  }
}
