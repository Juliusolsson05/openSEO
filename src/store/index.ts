import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { autopilotSlice, autopilotListener } from './slices/autopilotSlice'
import { blogUiSlice } from './slices/blogUiSlice'
import { dictionarySessionSlice } from './slices/dictionarySessionSlice'
import { editorUiSlice } from './slices/editorUiSlice'
import { permissionsSlice } from './slices/permissionsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    autopilot: autopilotSlice.reducer,
    blogUi: blogUiSlice.reducer,
    dictionarySession: dictionarySessionSlice.reducer,
    editorUi: editorUiSlice.reducer,
    permissions: permissionsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(autopilotListener.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
