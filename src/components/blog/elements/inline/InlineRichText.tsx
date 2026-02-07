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
  const { startEditing, stopEditing, isEditing } = useInlineEdit()
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

  useEffect(() => {
    if (!editor) return

    const handleBlur = () => {
      onBlur?.()
      stopEditing()
    }

    editor.on('blur', handleBlur)
    return () => {
      editor.off('blur', handleBlur)
    }
  }, [editor, onBlur, stopEditing])

  if (!active) {
    return (
      <div
        className={cn('group/inline relative cursor-text rounded-sm transition hover:border-dashed hover:border-border', className)}
        onClick={() => elementId && startEditing(elementId)}
      >
        {value ? (
          <div className="custom-content" dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <span className="text-muted-foreground">{placeholder ?? 'Click to edit...'}</span>
        )}
        <Pencil className="absolute right-1 top-1 h-3 w-3 opacity-0 transition group-hover/inline:opacity-40" />
      </div>
    )
  }

  if (!editor) return null

  return (
    <div className={cn('relative', className)}>
      <FloatingToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
