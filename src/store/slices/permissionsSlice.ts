import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const FEATURE_CONFIG = {
  publish: {
    id: 'publish',
    defaultAccess: false,
    restrictedMessage: 'Publishing features are not available in the demo.',
    description: 'Allows publishing and scheduling of blog posts',
  },
  simple_analytics: {
    id: 'simple_analytics',
    defaultAccess: false,
    restrictedMessage: 'This feature is not available in the demo.',
    description: 'Blocks some unfinished analytics features',
  },
  autopilot: {
    id: 'autopilot',
    defaultAccess: true,
    restrictedMessage: 'Autopilot features are not available in the demo.',
    description: 'Enables AI-powered content generation and enhancement',
  },
  image_generation: {
    id: 'image_generation',
    defaultAccess: true,
    restrictedMessage: 'Image generation is not available in the demo.',
    description: 'Allows AI generation of blog post images',
  },
  keyword_analysis: {
    id: 'keyword_analysis',
    defaultAccess: false,
    restrictedMessage: 'Keyword analysis is not available in the demo.',
    description: 'Provides SEO keyword analysis tools',
  },
  post_linking: {
    id: 'post_linking',
    defaultAccess: false,
    restrictedMessage: 'Post linking features are not available in the demo.',
    description: 'Enables automatic linking between related posts',
  },
  bulk_schedule: {
    id: 'bulk_schedule',
    defaultAccess: false,
    restrictedMessage: 'Bulk scheduling is not available in the demo.',
    description: 'Allows scheduling multiple posts at once',
  },
} as const

export type Feature = keyof typeof FEATURE_CONFIG

interface PermissionsState {
  features: Record<Feature, boolean>
  isDemoUser: boolean
  blockedModal: {
    isVisible: boolean
    currentFeature: Feature | null
  }
}

const initialState: PermissionsState = {
  features: Object.fromEntries(
    Object.entries(FEATURE_CONFIG).map(([key, config]) => [key, config.defaultAccess])
  ) as Record<Feature, boolean>,
  isDemoUser: true,
  blockedModal: {
    isVisible: false,
    currentFeature: null,
  },
}

export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setFeatureAccess(state, action: PayloadAction<{ feature: Feature; access: boolean }>) {
      state.features[action.payload.feature] = action.payload.access
    },
    setDemoMode(state, action: PayloadAction<boolean>) {
      state.isDemoUser = action.payload
    },
    showBlockedModal(state, action: PayloadAction<Feature>) {
      state.blockedModal.isVisible = true
      state.blockedModal.currentFeature = action.payload
    },
    hideBlockedModal(state) {
      state.blockedModal.isVisible = false
      state.blockedModal.currentFeature = null
    },
  },
})

export const { setFeatureAccess, setDemoMode, showBlockedModal, hideBlockedModal } = permissionsSlice.actions

// Selector factories (use with useAppSelector)
export const selectHasAccess = (feature: Feature) => (state: { permissions: PermissionsState }): boolean =>
  state.permissions.features[feature] ?? FEATURE_CONFIG[feature].defaultAccess

export const selectRestrictedMessage = (feature: Feature): string =>
  FEATURE_CONFIG[feature].restrictedMessage

export const selectIsDemoUser = (state: { permissions: PermissionsState }) => state.permissions.isDemoUser
