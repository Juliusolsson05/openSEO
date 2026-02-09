'use client'

import { useRef, useCallback, useState, useEffect } from 'react'

import type { SaveStatus } from '@/types/common'

export function useAutoSave(
  saveFn: (content: any) => Promise<boolean>,
  debounceMs = 1500
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestContentRef = useRef<any>(null)
  const isSaving = useRef(false)

  const save = useCallback(async (content: any) => {
    latestContentRef.current = content
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      if (isSaving.current) return
      isSaving.current = true
      setStatus('saving')
      try {
        const ok = await saveFn(latestContentRef.current)
        setStatus(ok ? 'saved' : 'error')
        setTimeout(() => setStatus('idle'), 2000)
      } catch {
        setStatus('error')
      } finally {
        isSaving.current = false
      }
    }, debounceMs)
  }, [saveFn, debounceMs])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const flush = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (latestContentRef.current && !isSaving.current) {
      isSaving.current = true
      setStatus('saving')
      try {
        await saveFn(latestContentRef.current)
        setStatus('saved')
      } catch {
        setStatus('error')
      } finally {
        isSaving.current = false
      }
    }
  }, [saveFn])

  return { save, flush, status }
}
