/**
 * Blocked feature modal hook — ported from aurora_dashboard/composables/useBlockedFeatureModal.ts
 * Uses a Zustand micro-store for shared modal state.
 */

import { create } from 'zustand'
import { usePermissionsStore, type Feature } from '@/stores/permissions-store'

interface BlockedFeatureModalState {
  isVisible: boolean
  currentFeature: Feature | null
  show: (feature: Feature) => void
  hide: () => void
}

const useBlockedFeatureModalStore = create<BlockedFeatureModalState>((set) => ({
  isVisible: false,
  currentFeature: null,
  show: (feature: Feature) => set({ isVisible: true, currentFeature: feature }),
  hide: () => set({ isVisible: false, currentFeature: null }),
}))

export function useBlockedFeatureModal() {
  const { isVisible, currentFeature, show, hide } = useBlockedFeatureModalStore()
  const { getRestrictedMessage, hasAccess } = usePermissionsStore()

  const message = currentFeature ? getRestrictedMessage(currentFeature) : ''

  /**
   * Guard a feature action. Returns true if blocked (modal shown).
   * Usage: if (guardFeature('publish')) return;
   */
  const guardFeature = (feature: Feature): boolean => {
    if (!hasAccess(feature)) {
      show(feature)
      return true
    }
    return false
  }

  return {
    isVisible,
    currentFeature,
    message,
    showBlockedFeatureModal: show,
    hideBlockedFeatureModal: hide,
    guardFeature,
  }
}
