'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'

interface InlineEditContextValue {
  isEditModeEnabled: boolean
  activeElementId: number | null
  startEditing: (elementId: number) => void
  stopEditing: () => void
  isEditing: (elementId: number) => boolean
}

const InlineEditContext = createContext<InlineEditContextValue>({
  isEditModeEnabled: false,
  activeElementId: null,
  startEditing: () => {},
  stopEditing: () => {},
  isEditing: () => false,
})

export function InlineEditProvider({ children }: { children: ReactNode }) {
  const [activeElementId, setActiveElementId] = useState<number | null>(null)
  const isEditModeEnabled = useAppSelector((s) => s.editorUi.isEditModeEnabled)

  useEffect(() => {
    if (!isEditModeEnabled) setActiveElementId(null)
  }, [isEditModeEnabled])

  const startEditing = useCallback((id: number) => {
    if (!isEditModeEnabled) return
    setActiveElementId(id)
  }, [isEditModeEnabled])

  const stopEditing = useCallback(() => setActiveElementId(null), [])

  useEffect(() => {
    if (!isEditModeEnabled || activeElementId == null) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const insideInlineEditor =
        target.closest('[data-inline-edit-root="true"]') ||
        target.closest('[data-inline-editor-action="true"]')
      if (!insideInlineEditor) {
        setActiveElementId(null)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveElementId(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isEditModeEnabled, activeElementId])
  const isEditing = useCallback((id: number) => isEditModeEnabled && activeElementId === id, [activeElementId, isEditModeEnabled])

  return (
    <InlineEditContext.Provider value={{ isEditModeEnabled, activeElementId, startEditing, stopEditing, isEditing }}>
      {children}
    </InlineEditContext.Provider>
  )
}

export function useInlineEdit() {
  return useContext(InlineEditContext)
}
