'use client'

import { useMemo, useState } from 'react'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>()

  const sortObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj
    if (seen.has(obj)) return null
    seen.add(obj)

    if (Array.isArray(obj)) return obj.map(sortObject)

    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(obj[key])
        return acc
      }, {} as Record<string, unknown>)
  }

  return JSON.stringify(sortObject(value))
}

export function useElementDraft<T extends object>(initial: T) {
  const [base, setBase] = useState<T>(() => clone(initial))
  const [draft, setDraft] = useState<T>(() => clone(initial))

  const isDirty = useMemo(() => stableStringify(base) !== stableStringify(draft), [base, draft])

  const patch = (patchValue: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...patchValue }))
  }

  const replace = (next: T) => {
    setDraft(clone(next))
  }

  const reset = () => {
    setDraft(clone(base))
  }

  const commit = (saved?: T) => {
    const next = saved ? clone(saved) : clone(draft)
    setBase(next)
    setDraft(next)
  }

  const rebase = (nextInitial: T) => {
    const next = clone(nextInitial)
    setBase(next)
    setDraft(next)
  }

  return {
    base,
    draft,
    setDraft,
    patch,
    replace,
    reset,
    commit,
    rebase,
    isDirty,
  }
}
