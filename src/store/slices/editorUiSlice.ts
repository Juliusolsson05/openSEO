import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface EditorUiState {
  isEditModeEnabled: boolean
}

const initialState: EditorUiState = {
  isEditModeEnabled: false,
}

export const editorUiSlice = createSlice({
  name: 'editorUi',
  initialState,
  reducers: {
    setEditMode(state, action: PayloadAction<boolean>) {
      state.isEditModeEnabled = action.payload
    },
    toggleEditMode(state) {
      state.isEditModeEnabled = !state.isEditModeEnabled
    },
  },
})

export const { setEditMode, toggleEditMode } = editorUiSlice.actions
