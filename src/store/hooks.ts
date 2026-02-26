import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector)

export const useAutopilotState = () => useAppSelector((s) => s.autopilot)
export const useAuthState = () => useAppSelector((s) => s.auth)
export const useEditorUiState = () => useAppSelector((s) => s.editorUi)
export const usePermissionsState = () => useAppSelector((s) => s.permissions)
