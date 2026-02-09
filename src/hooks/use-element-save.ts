'use client'

import { useCallback, useState } from 'react'

import type { SaveStatus } from '@/types/common'

export function useElementSave<T>(saveFn: (content: T) => Promise<{ success: boolean; error?: string }>) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(async (content: T) => {
    setStatus('saving')
    setError(null)

    try {
      const result = await saveFn(content)
      if (result.success) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 1500)
        return true
      }

      setStatus('error')
      setError(result.error ?? 'Failed to save element')
      return false
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Failed to save element')
      return false
    }
  }, [saveFn])

  return {
    save,
    status,
    error,
  }
}
