'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

interface UseActionOptions {
  /** Toast message on success (false = no toast) */
  successMessage?: string | false
  /** Toast message on error (true = use error.message, string = custom, false = no toast) */
  errorMessage?: string | boolean
  /** Called after successful completion */
  onSuccess?: () => void | Promise<void>
  /** Called after error */
  onError?: (error: Error) => void
  /** Show "Still working..." after this many ms (0 = disabled) */
  longRunningMs?: number
}

interface UseActionReturn {
  run: <T>(fn: () => Promise<T>) => Promise<T | undefined>
  loading: boolean
  error: Error | null
  elapsed: number
}

export function useAction(options: UseActionOptions = {}): UseActionReturn {
  const {
    successMessage = false,
    errorMessage = true,
    onSuccess,
    onError,
    longRunningMs = 5000,
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const longToastRef = useRef<string | number | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (longToastRef.current) {
      toast.dismiss(longToastRef.current)
      longToastRef.current = null
    }
    setElapsed(0)
  }, [])

  const run = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setLoading(true)
      setError(null)

      const start = Date.now()
      let longShown = false

      timerRef.current = setInterval(() => {
        const ms = Date.now() - start
        setElapsed(ms)

        if (longRunningMs > 0 && ms >= longRunningMs && !longShown) {
          longShown = true
          longToastRef.current = toast.loading('Still working on it...', {
            description: 'This operation may take a moment.',
          })
        }
      }, 500)

      try {
        const result = await fn()
        clearTimers()
        setLoading(false)

        if (successMessage !== false) {
          toast.success(successMessage || 'Done')
        }

        if (onSuccess) {
          await onSuccess()
        }

        return result
      } catch (e) {
        clearTimers()
        const err = e instanceof Error ? e : new Error(String(e))
        setError(err)
        setLoading(false)

        if (errorMessage !== false) {
          const msg =
            typeof errorMessage === 'string'
              ? errorMessage
              : err.message || 'Something went wrong'
          toast.error(msg)
        }

        onError?.(err)
        return undefined
      }
    },
    [successMessage, errorMessage, onSuccess, onError, longRunningMs, clearTimers],
  )

  return { run, loading, error, elapsed }
}
