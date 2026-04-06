'use client'

/**
 * BaseElement — wraps every blog element with edit/regenerate/enhance/humanize/delete actions.
 * Ported from aurora_dashboard/views/apps/blog/elements/base.vue
 */

import { useState, useCallback, type ReactNode } from 'react'
import { Pencil, RefreshCw, Sparkles, Heart, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useAppDispatch } from '@/store/hooks'
import { insertSkeletonLoader, removeSkeletonLoaderByOperationId, invalidatePost, newOperationId } from '@/store/slices/blogUiSlice'
import { BaseEdit } from './BaseEdit'
import { RegenerateModal } from './modals/RegenerateModal'
import { ConfirmDeleteModal } from './modals/ConfirmDeleteModal'
import { EnhanceModal } from './modals/EnhanceModal'
import { ComponentSelectModal } from './modals/ComponentSelectModal'
import SelectCTAModal from '@/components/blog/SelectCTAModal'
import { toast } from 'sonner'
import type { ElementType } from './types'

interface BaseElementProps {
  blogId: number
  elementId: number
  content: any
  children: ReactNode
  contentCols?: number
  allowEdit?: boolean
  allowRegenerate?: boolean
  allowEnhance?: boolean
  allowHumanize?: boolean
  allowDelete?: boolean
  allowAddElement?: boolean
  onContentUpdated?: (content: any) => void
  onElementAdded?: (element: any) => void
  onElementDeleted?: (elementId: number) => void
  onOpenCtaModal?: () => void
}

export function BaseElement({
  blogId,
  elementId,
  content,
  children,
  allowEdit = true,
  allowRegenerate = true,
  allowEnhance = true,
  allowHumanize = true,
  allowDelete = true,
  allowAddElement = true,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
  onOpenCtaModal,
}: BaseElementProps) {
  const [showAddButton, setShowAddButton] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [showEnhanceModal, setShowEnhanceModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddElementModal, setShowAddElementModal] = useState(false)
  const [showSelectCtaModal, setShowSelectCtaModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const dispatch = useAppDispatch()
  const elementsApi = useElementsApi()

  const handleContentUpdated = useCallback(
    (updatedContent: any) => {
      onContentUpdated?.(updatedContent)
      setShowEditModal(false)
    },
    [onContentUpdated]
  )

  const handleRegenerate = useCallback(
    async (payload: {
      regeneration_note: string
      new_element_type?: string
      new_element_count?: number
    }) => {
      setShowRegenerateModal(false)
      const opId = newOperationId()
      dispatch(insertSkeletonLoader(blogId, opId, {
        elementId,
        type: 'regeneration',
        status: 'in_progress',
        elementType: payload.new_element_type,
      }) as any)
      const toastId = toast.loading('Regenerating element...')
      try {
        const result = await elementsApi.regenerateElement({
          blog_post_id: blogId,
          blog_element_id: elementId,
          regeneration_note: payload.regeneration_note,
          new_element_type: payload.new_element_type,
          new_element_count: payload.new_element_count,
        })
        if (result.success) {
          dispatch(invalidatePost(blogId) as any)
          toast.success('Element regenerated', { id: toastId })
        } else {
          dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
          toast.error('Failed to regenerate element', { id: toastId })
        }
      } catch {
        dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
        toast.error('Failed to regenerate element', { id: toastId })
      }
    },
    [blogId, elementId, elementsApi, dispatch]
  )

  const handleEnhance = useCallback(async () => {
    setShowEnhanceModal(false)
    const opId = newOperationId()
    dispatch(insertSkeletonLoader(blogId, opId, {
      elementId,
      type: 'enhancement',
      status: 'in_progress',
    }) as any)
    const toastId = toast.loading('Enhancing element...')
    try {
      const result = await elementsApi.enhanceElement(blogId, elementId)
      if (result.success) {
        dispatch(invalidatePost(blogId) as any)
        toast.success('Element enhanced', { id: toastId })
      } else {
        dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
        toast.error('Failed to enhance element', { id: toastId })
      }
    } catch {
      dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
      toast.error('Failed to enhance element', { id: toastId })
    }
  }, [blogId, elementId, elementsApi, dispatch])

  const handleHumanize = useCallback(async () => {
    const opId = newOperationId()
    dispatch(insertSkeletonLoader(blogId, opId, {
      elementId,
      type: 'enhancement',
      status: 'in_progress',
    }) as any)
    const toastId = toast.loading('Humanizing element...')
    try {
      const result = await elementsApi.humanizeElement(blogId, elementId)
      if (result.success) {
        dispatch(invalidatePost(blogId) as any)
        toast.success('Element humanized', { id: toastId })
      } else {
        dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
        toast.error('Failed to humanize element', { id: toastId })
      }
    } catch {
      dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
      toast.error('Failed to humanize element', { id: toastId })
    }
  }, [blogId, elementId, elementsApi, dispatch])

  const handleDelete = useCallback(async () => {
    setShowDeleteModal(false)
    setLoading(true)
    try {
      const result = await elementsApi.deleteElement(blogId, elementId)
      if (result.success) {
        onElementDeleted?.(elementId)
        dispatch(invalidatePost(blogId) as any)
        toast.success('Element deleted')
      } else {
        toast.error(result.error || 'Failed to delete element')
      }
    } catch {
      toast.error('Failed to delete element')
    } finally {
      setLoading(false)
    }
  }, [blogId, elementId, elementsApi, dispatch, onElementDeleted])

  const handleAddElement = useCallback(
    async (elementType: ElementType, note?: string) => {
      setShowAddElementModal(false)
      const opId = newOperationId()
      dispatch(insertSkeletonLoader(blogId, opId, {
        elementId,
        type: 'new',
        status: 'in_progress',
        position: { afterElementId: elementId },
        elementType,
      }) as any)
      const toastId = toast.loading('Adding element...')
      try {
        const result = await elementsApi.addElement({
          blog_post_id: blogId,
          element_id: elementId,
          element_type: elementType,
          generation_note: note,
        })
        if (result.success) {
          dispatch(invalidatePost(blogId) as any)
          toast.success('Element added', { id: toastId })
        } else {
          dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
          toast.error('Failed to add element', { id: toastId })
        }
      } catch {
        dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
        toast.error('Failed to add element', { id: toastId })
      }
    },
    [blogId, elementId, elementsApi, dispatch]
  )

  const handleTemplateSelect = useCallback((templateId: string) => {
    if (templateId === 'call_to_action') {
      setShowAddElementModal(false)
      setShowSelectCtaModal(true)
      return
    }
    setShowAddElementModal(false)
  }, [])

  const handleCtaSelected = useCallback(async (ctaId: number) => {
    const opId = newOperationId()
    const toastId = toast.loading('Adding CTA...')

    dispatch(insertSkeletonLoader(blogId, opId, {
      elementId,
      type: 'new',
      status: 'in_progress',
      position: { afterElementId: elementId },
      elementType: 'call_to_action',
    }) as any)

    try {
      const result = await elementsApi.addElement({
        blog_post_id: blogId,
        element_id: elementId,
        cta_id: ctaId,
      })

      if (result.success) {
        dispatch(invalidatePost(blogId) as any)
        toast.success('CTA inserted', { id: toastId })
      } else {
        dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
        toast.error(result.error || 'Failed to insert CTA', { id: toastId })
      }
    } catch {
      dispatch(removeSkeletonLoaderByOperationId(blogId, opId) as any)
      toast.error('Failed to insert CTA', { id: toastId })
    } finally {
      setShowSelectCtaModal(false)
    }
  }, [blogId, elementId, elementsApi, dispatch])

  return (
    <div
      className="relative mb-5 group"
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      <div className="flex gap-2">
        <div className="flex-1">{children}</div>

        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {allowEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEditModal(true)} disabled={loading}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {allowRegenerate && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowRegenerateModal(true)} disabled={loading}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          {allowEnhance && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEnhanceModal(true)} disabled={loading}>
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          )}
          {allowHumanize && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleHumanize} disabled={loading}>
              <Heart className="h-3.5 w-3.5" />
            </Button>
          )}
          {allowDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setShowDeleteModal(true)} disabled={loading}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {showAddButton && allowAddElement && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-[1]">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-background shadow-sm"
            onClick={() => setShowAddElementModal(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <BaseEdit
        open={showEditModal}
        onOpenChange={setShowEditModal}
        content={content}
        blogId={blogId}
        elementId={elementId}
        onContentUpdated={handleContentUpdated}
      />

      <RegenerateModal
        open={showRegenerateModal}
        onOpenChange={setShowRegenerateModal}
        onRegenerate={handleRegenerate}
        loading={loading}
      />

      <EnhanceModal
        open={showEnhanceModal}
        onOpenChange={setShowEnhanceModal}
        onEnhance={handleEnhance}
        loading={loading}
      />

      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        loading={loading}
      />

      <ComponentSelectModal
        open={showAddElementModal}
        onOpenChange={setShowAddElementModal}
        onSelect={handleAddElement}
        onTemplateSelect={handleTemplateSelect}
        loading={loading}
      />

      <SelectCTAModal
        modelValue={showSelectCtaModal}
        onOpenChange={setShowSelectCtaModal}
        onCtaSelected={handleCtaSelected}
      />
    </div>
  )
}
