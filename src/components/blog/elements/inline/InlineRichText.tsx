'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInlineEdit } from './InlineEditProvider'
import { FloatingToolbar } from './FloatingToolbar'

interface InlineRichTextProps {
  value: string
  onChange: (html: string) => void
  className?: string
  placeholder?: string
  elementId?: number
  onBlur?: () => void
}

export function InlineRichText({ value, onChange, className, placeholder, elementId, onBlur }: InlineRichTextProps) {
  const { isEditModeEnabled, startEditing, isEditing } = useInlineEdit()
  const active = elementId ? isEditing(elementId) : false

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write something...',
      }),
    ],
    content: value,
    editable: active,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 outline-none',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  useEffect(() => {
    if (editor) {
      editor.setEditable(active)
      if (active) editor.commands.focus('end')
    }
  }, [active, editor])

  // Intentionally no blur auto-save/auto-close here.
  // Save/close should be explicit in element-level editors.

  if (!active) {
    return (
      <div
        className={cn(
          'group/inline relative rounded-sm transition',
          isEditModeEnabled && 'cursor-text hover:border-dashed hover:border-border',
          className,
        )}
        onClick={() => isEditModeEnabled && elementId && startEditing(elementId)}
      >
        {value ? (
          <div className="custom-content" dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <span className="text-muted-foreground">{placeholder ?? 'Click to edit...'}</span>
        )}
        {isEditModeEnabled ? <Pencil className="absolute right-1 top-1 h-3 w-3 opacity-0 transition group-hover/inline:opacity-40" /> : null}
      </div>
    )
  }

  if (!editor) return null

  return (
    <div data-inline-edit-root="true" className={cn('relative', className)}>
      <FloatingToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
