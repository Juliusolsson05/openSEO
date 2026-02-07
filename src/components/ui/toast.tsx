"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastItem = { id: string; title?: string; description?: string }

const ToastContext = React.createContext<{
  toasts: ToastItem[]
  toast: (t: Omit<ToastItem, "id">) => void
  dismiss: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, ...t }])
    setTimeout(() => dismiss(id), 3000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastViewport() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {ctx.toasts.map((t) => (
        <div key={t.id} className={cn("rounded-md border border-border bg-background p-3 shadow-md")}> 
          <div className="flex items-start justify-between gap-2">
            <div>
              {t.title ? <p className="text-sm font-medium">{t.title}</p> : null}
              {t.description ? <p className="text-xs text-muted-foreground">{t.description}</p> : null}
            </div>
            <button onClick={() => ctx.dismiss(t.id)} className="rounded-sm p-1 hover:bg-muted" aria-label="Dismiss toast">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
