'use client'

import { create } from 'zustand'

interface EditorUiState {
  isEditModeEnabled: boolean
  setEditMode: (enabled: boolean) => void
  toggleEditMode: () => void
}

export const useEditorUiStore = create<EditorUiState>((set) => ({
  isEditModeEnabled: false,
  setEditMode: (enabled) => set({ isEditModeEnabled: enabled }),
  toggleEditMode: () => set((state) => ({ isEditModeEnabled: !state.isEditModeEnabled })),
}))
