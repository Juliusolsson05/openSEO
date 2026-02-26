'use client'

/**
 * BaseEdit — edit modal that renders dynamic form fields based on edit schemas.
 * Ported from aurora_dashboard/views/apps/blog/elements/BaseEdit.vue
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { EditFieldRenderer } from './edit/EditFieldRenderer'
import { usePostQuery } from '@/hooks/queries/blog'
import { useElementsApi } from '@/hooks/use-elements-api'
import { getEditSchema } from './registry'
import type { ElementType, EditField } from './types'

interface BaseEditProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: any
  blogId: number
  elementId: number
  onContentUpdated?: (content: any) => void
}

export function BaseEdit({
  open,
  onOpenChange,
  content,
  blogId,
  elementId,
  onContentUpdated,
}: BaseEditProps) {
  const [editedContent, setEditedContent] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { data: post } = usePostQuery(blogId)
  const { updateElement } = useElementsApi()

  const elementType = post?.elements.find((el) => el.id === elementId)
    ?.element_type as ElementType | undefined

  const editSchema = elementType ? getEditSchema(elementType) : null

  useEffect(() => {
    if (open) {
      setEditedContent({ ...content })
    }
  }, [open, content])

  const handleFieldUpdate = (key: string, value: any, passthrough?: boolean) => {
    if (passthrough) {
      setEditedContent(value)
    } else {
      setEditedContent((prev: any) => ({ ...prev, [key]: value }))
    }
  }

  const handlePooledFieldUpdate = (keys: string[], value: any) => {
    setEditedContent((prev: any) => {
      const updated = { ...prev }
      keys.forEach((key) => {
        updated[key] = value[key]
      })
      return updated
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateElement(elementId, editedContent, blogId)
      if (result.success) {
        onContentUpdated?.(editedContent)
        onOpenChange(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl max-h-[80vh] overflow-y-auto p-0">
        <VisuallyHidden><DialogTitle>Edit Element</DialogTitle></VisuallyHidden>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editSchema?.title || 'Edit Content'}
          </h2>

          {editSchema ? (
            <div className="space-y-4">
              {Object.entries(editSchema.fields).map(([key, field]) => {
                if ('poolField' in field && field.poolField) {
                  const pf = field.poolField
                  const pooledValue = pf.keys.reduce(
                    (acc: any, k: string) => ({ ...acc, [k]: editedContent[k] }),
                    {}
                  )
                  return (
                    <EditFieldRenderer
                      key={key}
                      field={pf.field}
                      value={pooledValue}
                      onChange={(val) => handlePooledFieldUpdate(pf.keys, val)}
                    />
                  )
                }

                const editField = field as EditField
                const value = editField.passthrough ? editedContent : editedContent[key]
                return (
                  <EditFieldRenderer
                    key={key}
                    field={editField}
                    value={value}
                    onChange={(val) => handleFieldUpdate(key, val, editField.passthrough)}
                  />
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No edit schema available for this element type.</p>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
