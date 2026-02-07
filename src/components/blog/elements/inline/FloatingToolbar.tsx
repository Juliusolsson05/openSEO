'use client'

import { useState, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FloatingToolbarProps {
  editor: Editor
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection
      if (from === to) {
        setVisible(false)
        return
      }

      // Get the DOM position of the selection
      const { view } = editor
      try {
        const start = view.coordsAtPos(from)
        const end = view.coordsAtPos(to)
        const top = Math.min(start.top, end.top) - 48
        const left = (start.left + end.left) / 2
        setCoords({ top, left })
        setVisible(true)
      } catch {
        setVisible(false)
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('blur', () => setTimeout(() => setVisible(false), 200))
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor])

  const setLink = () => {
    const value = linkUrl.trim()
    if (!value) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: value, target: '_blank' }).run()
    setLinkUrl('')
  }

  if (!visible) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-1 rounded-md border border-border bg-sidebar p-1 text-sidebar-foreground shadow-lg"
      style={{ top: `${coords.top}px`, left: `${coords.left}px`, transform: 'translateX(-50%)' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="B" />
      <ToolButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" />
      <ToolButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} label="U" />
      <ToolButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="•" />
      <ToolButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1." />
      <ToolButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
      <ToolButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" />
      <div className="mx-1 h-5 w-px bg-sidebar-foreground/20" />
      <Input
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            setLink()
          }
        }}
        className="h-7 w-32 border-sidebar-foreground/20 bg-sidebar text-xs text-sidebar-foreground"
        placeholder="https://..."
      />
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={setLink}>
        🔗
      </Button>
    </div>
  )
}

function ToolButton({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={cn('h-7 min-w-7 px-2 text-xs', active && 'bg-sidebar-foreground/15')}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
