'use client'

/**
 * BaseElement — wraps every blog element with edit/regenerate/enhance/humanize/delete actions.
 * Ported from aurora_dashboard/views/apps/blog/elements/base.vue
 */

import { useState, useCallback, type ReactNode } from 'react'
import { Pencil, RefreshCw, Sparkles, Heart, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useElementsStore } from '@/stores/elements-store'
import { useBlogStore } from '@/stores/blog-store'
import { BaseEdit } from './BaseEdit'
import { RegenerateModal } from './modals/RegenerateModal'
import { ConfirmDeleteModal } from './modals/ConfirmDeleteModal'
import { EnhanceModal } from './modals/EnhanceModal'
import { ComponentSelectModal } from './modals/ComponentSelectModal'
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
  const [loading, setLoading] = useState(false)

  const elementsStore = useElementsStore()
  const fetchPost = useBlogStore((s) => s.fetchPost)
  const post = useBlogStore((s) => s.post)

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
      setLoading(true)
      try {
        const result = await elementsStore.regenerateElement({
          blog_post_id: blogId,
          blog_element_id: elementId,
          regeneration_note: payload.regeneration_note,
          new_element_type: payload.new_element_type,
          new_element_count: payload.new_element_count,
        })
        if (result.success && post) {
          await fetchPost(post.id, true)
        }
      } finally {
        setLoading(false)
        setShowRegenerateModal(false)
      }
    },
    [blogId, elementId, elementsStore, fetchPost, post]
  )

  const handleEnhance = useCallback(async () => {
    setLoading(true)
    try {
      const result = await elementsStore.enhanceElement(blogId, elementId)
      if (result.success && post) {
        await fetchPost(post.id, true)
      }
    } finally {
      setLoading(false)
      setShowEnhanceModal(false)
    }
  }, [blogId, elementId, elementsStore, fetchPost, post])

  const handleHumanize = useCallback(async () => {
    setLoading(true)
    try {
      const result = await elementsStore.humanizeElement(blogId, elementId)
      if (result.success && post) {
        await fetchPost(post.id, true)
      }
    } finally {
      setLoading(false)
    }
  }, [blogId, elementId, elementsStore, fetchPost, post])

  const handleDelete = useCallback(async () => {
    setLoading(true)
    try {
      const result = await elementsStore.deleteElement(blogId, elementId)
      if (result.success) {
        onElementDeleted?.(elementId)
        if (post) await fetchPost(post.id, true)
      }
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
    }
  }, [blogId, elementId, elementsStore, fetchPost, post, onElementDeleted])

  const handleAddElement = useCallback(
    async (elementType: ElementType, note?: string) => {
      setLoading(true)
      try {
        const result = await elementsStore.addElement({
          blog_post_id: blogId,
          element_id: elementId,
          element_type: elementType,
          generation_note: note,
        })
        if (result.success && post) {
          await fetchPost(post.id, true)
        }
      } finally {
        setLoading(false)
        setShowAddElementModal(false)
      }
    },
    [blogId, elementId, elementsStore, fetchPost, post]
  )

  const handleTemplateSelect = useCallback(
    (templateId: string) => {
      if (templateId === 'call_to_action') {
        if (onOpenCtaModal) {
          onOpenCtaModal()
        } else {
          console.log('CTA template selected (no CTA modal wired yet).')
        }
      }
      setShowAddElementModal(false)
    },
    [onOpenCtaModal]
  )

  return (
    <div
      className="relative mb-5 group"
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="flex gap-2">
        {/* Content */}
        <div className="flex-1">{children}</div>

        {/* Action buttons */}
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

      {/* Add element button */}
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

      {/* Modals */}
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
    </div>
  )
}
