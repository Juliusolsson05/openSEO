import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { USER_TYPES, type AuthUser } from '@/types/auth'

export { USER_TYPES, type AuthUser } from '@/types/auth'

function getAbilityRules(userType: number | null | undefined): string[] {
  switch (userType) {
    case USER_TYPES.Administrator:
      return ['manage:all']
    case USER_TYPES.Agency:
      return ['read:dashboard', 'manage:campaigns', 'manage:reports']
    case USER_TYPES.Client:
      return ['read:dashboard', 'read:reports']
    case USER_TYPES.Demo:
      return ['read:dashboard']
    default:
      return []
  }
}

interface AuthState {
  userData: AuthUser | null
  userAbilityRules: string[]
  isAuthenticated: boolean
}

const initialState: AuthState = {
  userData: null,
  userAbilityRules: [],
  isAuthenticated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.userData = action.payload
      state.isAuthenticated = !!action.payload
      state.userAbilityRules = getAbilityRules(action.payload?.userType)
    },
    logout(state) {
      state.userData = null
      state.isAuthenticated = false
      state.userAbilityRules = []
    },
  },
})

export const { setUser, logout } = authSlice.actions
