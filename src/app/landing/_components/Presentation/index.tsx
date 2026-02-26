'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { THEME } from './theme'

import { TitleSlide } from './slides/TitleSlide'
import { ConnectSlide } from './slides/ConnectSlide'
import { GenerateSlide } from './slides/GenerateSlide'
import { FullPostSlide } from './slides/FullPostSlide'
import { AutopilotSlide } from './slides/AutopilotSlide'
import { ElementsSlide } from './slides/ElementsSlide'
import { PublishSlide } from './slides/PublishSlide'
import { CtaSlide } from './slides/CtaSlide'

const SLIDES = [
  TitleSlide,
  ConnectSlide,
  GenerateSlide,
  FullPostSlide,
  AutopilotSlide,
  ElementsSlide,
  PublishSlide,
  CtaSlide,
]

const SLIDE_LABELS = [
  'Intro',
  'Connect',
  'Generate',
  'Full post',
  'Autopilot',
  'Elements',
  'Publish',
  'Get started',
]

const AUTO_ADVANCE_MS = 6000

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
}

export function Presentation() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback(
    (next: number) => {
      setDirection(next > index ? 1 : -1)
      setIndex(next)
    },
    [index],
  )

  const next = useCallback(() => {
    if (index < SLIDES.length - 1) go(index + 1)
    else go(0)
  }, [index, go])

  const prev = useCallback(() => {
    if (index > 0) go(index - 1)
  }, [index, go])

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  // auto-advance
  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [index, paused, next])

  const SlideComponent = SLIDES[index]

  return (
    <section
      id="demo"
      className="py-16 md:py-24"
      style={{ background: THEME.colors.surfaceAlt, borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}` }}
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: THEME.colors.primary }}
        >
          See it in action
        </p>
        <h2
          className="mt-2 text-[24px] font-semibold md:text-[30px]"
          style={{ color: THEME.colors.foreground, letterSpacing: '-0.01em' }}
        >
          From topic to published post.
        </h2>
        <p
          className="mt-2 max-w-md text-[14px]"
          style={{ color: THEME.colors.muted }}
        >
          Walk through the full Aurora workflow — step by step.
        </p>

        <div
          className="relative mt-10 overflow-hidden"
          style={{
            background: THEME.colors.surface,
            border: `1px solid ${THEME.colors.border}`,
            borderRadius: THEME.radii.md,
            aspectRatio: '16 / 9',
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              <SlideComponent />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center transition-opacity"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.radii.sm,
              opacity: index === 0 ? 0.3 : 0.8,
              cursor: index === 0 ? 'default' : 'pointer',
            }}
            disabled={index === 0}
          >
            <ChevronLeft className="h-4 w-4" style={{ color: THEME.colors.foreground }} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center transition-opacity"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.radii.sm,
              opacity: 0.8,
              cursor: 'pointer',
            }}
          >
            <ChevronRight className="h-4 w-4" style={{ color: THEME.colors.foreground }} />
          </button>

          <div
            className="absolute bottom-3 right-4 text-[11px]"
            style={{ color: THEME.colors.mutedLight }}
          >
            {index + 1} / {SLIDES.length}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="group relative flex flex-col items-center px-1"
            >
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 24 : 8,
                  background: i === index ? THEME.colors.primary : THEME.colors.border,
                }}
              />
              <span
                className="mt-1.5 hidden text-[10px] font-medium md:block transition-colors"
                style={{
                  color: i === index ? THEME.colors.primary : THEME.colors.mutedLight,
                }}
              >
                {SLIDE_LABELS[i]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
