'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Sparkles, X, ArrowRight, AlertCircle } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { startAutopilot } from '@/store/slices/autopilotSlice'

interface Props {
  postId: number
}

export default function QuilloAutopilot({ postId }: Props) {
  const [showTooltip, setShowTooltip] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const isRunning = useAppSelector((s) => s.autopilot.isRunning)
  const dispatch = useAppDispatch()

  const handleScroll = useCallback(() => {
    if (window.scrollY > 50 && showTooltip) {
      setShowTooltip(false)
      setCollapsed(true)
    }
  }, [showTooltip])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleClick = () => {
    if (isRunning) return
    setShowModal(true)
  }

  const handleStart = async () => {
    setShowModal(false)
    try {
      await dispatch(startAutopilot(postId))
    } catch (err) {
      console.error('Autopilot failed:', err)
    }
  }

  return createPortal(
    <>
      <div className={`fixed z-40 transition-all duration-300 ${
        collapsed ? 'top-1/2 right-0 -translate-y-1/2' : 'top-20 right-6'
      }`}>
        <div className="flex items-start gap-3">
          {showTooltip && !collapsed && (
            <div className="relative bg-white border border-border rounded-sm p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium">Try me</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowTooltip(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 text-[12px] gap-1 mt-1" onClick={() => { setShowTooltip(false); setShowModal(true) }}>
                Read more <ArrowRight className="h-3 w-3" />
              </Button>
              <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-white" />
            </div>
          )}
          <Button
            onClick={handleClick}
            disabled={isRunning}
            size="icon"
            className={`bg-sidebar text-white transition-all hover:bg-sidebar-muted disabled:opacity-60 ${
              collapsed
                ? 'h-16 w-12 rounded-l-full'
                : 'h-14 w-14 rounded-full shadow-lg'
            } ${isRunning ? 'animate-pulse bg-primary' : ''}`}
          >
            <Sparkles className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'} text-white`} />
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-full max-w-md p-0 border-0 bg-transparent shadow-none">
          <VisuallyHidden><DialogTitle>Quillo Autopilot</DialogTitle></VisuallyHidden>
          <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-[16px]">Quillo Autopilot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">
                Autopilot is currently being migrated. Some features may run slower than usual while we optimize the new backend.
              </p>
            </div>
            <p className="text-[13px] text-muted-foreground">
              Quillo Autopilot enhances your blog by:
            </p>
            <ul className="text-[13px] text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Automatically generating relevant images</li>
              <li>Adding rich, contextual content</li>
              <li>Optimizing for better engagement</li>
              <li>Saving time while maintaining quality</li>
            </ul>
            <p className="text-[13px] text-muted-foreground">
              Let Quillo transform your blog posts into compelling content automatically.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleStart} disabled={isRunning}>Start Autopilot</Button>
            </div>
          </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>,
    document.body
  )
}
