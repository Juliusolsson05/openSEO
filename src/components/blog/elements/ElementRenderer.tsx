'use client'

/**
 * ElementRenderer — resolves element_type to the correct component and renders it.
 * Handles loading skeleton state and fallback to DefaultComponent.
 */

import { Skeleton } from '@/components/ui/skeleton'
import { getComponent, getLoadingComponent } from './registry'
import { BaseElement } from './BaseElement'
import type { BlogPostElement } from '@/stores/types'
import type { ElementType } from './types'

interface ElementRendererProps {
  element: BlogPostElement
  blogId: number
  /** true = inside the post editor (actions visible), false = preview mode */
  editable?: boolean
  onContentUpdated?: (content: any) => void
  onElementAdded?: (element: any) => void
  onElementDeleted?: (elementId: number) => void
}

export function ElementRenderer({
  element,
  blogId,
  editable = true,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
}: ElementRendererProps) {
  // Loading skeleton
  if (element.isLoading) {
    const Loading = getLoadingComponent(element.element_type as ElementType)
    return <Loading />
  }

  const Component = getComponent(element.element_type as ElementType)

  if (editable) {
    return (
      <BaseElement
        blogId={blogId}
        elementId={element.id}
        content={element.content}
        onContentUpdated={onContentUpdated}
        onElementAdded={onElementAdded}
        onElementDeleted={onElementDeleted}
      >
        <Component
          content={element.content}
          blogId={blogId}
          elementId={element.id}
          onContentUpdated={onContentUpdated}
          onElementAdded={onElementAdded}
          onElementDeleted={onElementDeleted}
        />
      </BaseElement>
    )
  }

  // Preview mode — no action buttons
  return (
    <Component
      content={element.content}
      blogId={blogId}
      elementId={element.id}
    />
  )
}
