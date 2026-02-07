'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface InlineEditContextValue {
  activeElementId: number | null
  startEditing: (elementId: number) => void
  stopEditing: () => void
  isEditing: (elementId: number) => boolean
}

const InlineEditContext = createContext<InlineEditContextValue>({
  activeElementId: null,
  startEditing: () => {},
  stopEditing: () => {},
  isEditing: () => false,
})

export function InlineEditProvider({ children }: { children: ReactNode }) {
  const [activeElementId, setActiveElementId] = useState<number | null>(null)

  const startEditing = useCallback((id: number) => setActiveElementId(id), [])
  const stopEditing = useCallback(() => setActiveElementId(null), [])
  const isEditing = useCallback((id: number) => activeElementId === id, [activeElementId])

  return (
    <InlineEditContext.Provider value={{ activeElementId, startEditing, stopEditing, isEditing }}>
      {children}
    </InlineEditContext.Provider>
  )
}

export function useInlineEdit() {
  return useContext(InlineEditContext)
}
