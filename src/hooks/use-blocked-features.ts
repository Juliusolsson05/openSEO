/**
 * Blocked feature modal hook — ported from aurora_dashboard/composables/useBlockedFeatureModal.ts
 * Uses Redux permissionsSlice for shared modal state.
 */

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  showBlockedModal,
  hideBlockedModal,
  selectHasAccess,
  selectRestrictedMessage,
  FEATURE_CONFIG,
  type Feature,
} from '@/store/slices/permissionsSlice'

export type { Feature }

export function useBlockedFeatureModal() {
  const dispatch = useAppDispatch()
  const { isVisible, currentFeature } = useAppSelector((s) => s.permissions.blockedModal)
  const featuresMap = useAppSelector((s) => s.permissions.features)

  const hasAccess = (feature: Feature): boolean =>
    featuresMap[feature] ?? FEATURE_CONFIG[feature].defaultAccess

  const message = currentFeature ? FEATURE_CONFIG[currentFeature].restrictedMessage : ''

  /**
   * Guard a feature action. Returns true if blocked (modal shown).
   * Usage: if (guardFeature('publish')) return;
   */
  const guardFeature = (feature: Feature): boolean => {
    if (!hasAccess(feature)) {
      dispatch(showBlockedModal(feature))
      return true
    }
    return false
  }

  return {
    isVisible,
    currentFeature,
    message,
    showBlockedFeatureModal: (feature: Feature) => dispatch(showBlockedModal(feature)),
    hideBlockedFeatureModal: () => dispatch(hideBlockedModal()),
    guardFeature,
  }
}
