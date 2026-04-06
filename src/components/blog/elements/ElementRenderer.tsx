'use client'

/**
 * ElementRenderer — resolves element_type to the correct component and renders it.
 * Handles loading skeleton state and fallback to DefaultComponent.
 *
 * NOTE: Individual components (Paragraph, FAQ, etc.) already wrap themselves
 * in <BaseElement> internally, so we do NOT wrap again here.
 */

import { getComponent, getLoadingComponent, getPreviewComponent, type PreviewComponentProps } from './registry'
import type { BlogPostElement } from '@/types/blog'
import type { ElementType } from './types'

interface ElementRendererProps {
  element: BlogPostElement
  blogId: number
  /** true = inside the post editor (actions visible), false = preview mode */
  editable?: boolean
  /** Force preview component registry when rendering read-only output */
  preview?: boolean
  /** Additional props forwarded to preview components */
  previewProps?: Omit<PreviewComponentProps, 'content'>
  onContentUpdated?: (content: any) => void
  onElementAdded?: (element: any) => void
  onElementDeleted?: (elementId: number) => void
}

export function ElementRenderer({
  element,
  blogId,
  editable = true,
  preview = false,
  previewProps,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
}: ElementRendererProps) {
  if (element.isLoading) {
    const Loading = getLoadingComponent(element.element_type as ElementType)
    return <Loading />
  }

  if (editable && !preview) {
    const Component = getComponent(element.element_type as ElementType)

    return (
      <Component
        content={element.content}
        blogId={blogId}
        elementId={element.id as number}
        hyperlink={element.hyperlink}
        onContentUpdated={onContentUpdated}
        onElementAdded={onElementAdded}
        onElementDeleted={onElementDeleted}
      />
    )
  }

  const PreviewComponent = getPreviewComponent(element.element_type as ElementType)

  return (
    <PreviewComponent
      content={element.content}
      blogId={blogId}
      elementId={element.id as number}
      hyperlink={element.hyperlink}
      {...previewProps}
    />
  )
}
