/**
 * Permissions store — ported from aurora_dashboard/stores/users/permissionsStore.ts
 */

import { create } from 'zustand'

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

  hasAccess: (feature: Feature) => boolean
  getRestrictedMessage: (feature: Feature) => string
  setFeatureAccess: (feature: Feature, access: boolean) => void
  setDemoMode: (isDemo: boolean) => void
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  features: Object.fromEntries(
    Object.entries(FEATURE_CONFIG).map(([key, config]) => [key, config.defaultAccess])
  ) as Record<Feature, boolean>,
  isDemoUser: true,

  hasAccess: (feature) => {
    return get().features[feature] ?? FEATURE_CONFIG[feature].defaultAccess
  },

  getRestrictedMessage: (feature) => {
    return FEATURE_CONFIG[feature].restrictedMessage
  },

  setFeatureAccess: (feature, access) => {
    set((state) => ({
      features: { ...state.features, [feature]: access },
    }))
  },

  setDemoMode: (isDemo) => set({ isDemoUser: isDemo }),
}))
