'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useEditorUiStore } from '@/stores/editor-ui-store'

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
  const isEditModeEnabled = useEditorUiStore((s) => s.isEditModeEnabled)

  useEffect(() => {
    if (!isEditModeEnabled) setActiveElementId(null)
  }, [isEditModeEnabled])

  const startEditing = useCallback((id: number) => {
    if (!isEditModeEnabled) return
    setActiveElementId(id)
  }, [isEditModeEnabled])

  const stopEditing = useCallback(() => setActiveElementId(null), [])
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
