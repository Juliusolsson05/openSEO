'use client'

import { useCallback, useEffect, useState } from 'react'
import { Joyride, type EventData, type Controls, STATUS, ACTIONS, EVENTS, type Step } from 'react-joyride'

const STEPS: Step[] = [
  {
    target: '[data-tour="nav-blog-posts"]',
    title: 'Blog Posts',
    content:
      'This is your content hub. All generated posts live here — create, edit, and manage them.',
    placement: 'right',
    skipBeacon: true,
  },
  {
    target: '[data-tour="generate-post-btn"]',
    title: 'Generate a Post',
    content:
      'Click here to generate your first blog post from a title in the queue. OpenSEO handles structure, SEO, and content automatically.',
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    target: '[data-tour="nav-titles"]',
    title: 'Titles',
    content:
      'Generate SEO-optimized blog titles based on your industry. Each title becomes a post when you hit generate.',
    placement: 'right',
    skipBeacon: true,
  },
  {
    target: '[data-tour="nav-analytics"]',
    title: 'Analytics',
    content:
      'Track content performance — readability scores, keyword density, internal linking, and more.',
    placement: 'right',
    skipBeacon: true,
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Settings',
    content:
      'Configure your publishing endpoint, API keys, company profile, and AI model preferences.',
    placement: 'right',
    skipBeacon: true,
  },
  {
    target: '[data-tour="topbar-search"]',
    title: 'Global Search',
    content:
      'Quickly find any post, title, dictionary entry, or product across your workspace.',
    placement: 'bottom',
    skipBeacon: true,
  },
]

interface Props {
  userId: string
  enabled: boolean
  onFinish?: () => void
}

export function OnboardingTour({ userId, enabled, onFinish }: Props) {
  const [run, setRun] = useState(enabled)
  const [stepIndex, setStepIndex] = useState(0)
  const [targetsReady, setTargetsReady] = useState(false)

  // Sync with parent — restart when enabled flips to true
  useEffect(() => {
    if (!enabled) {
      setRun(false)
      setTargetsReady(false)
      return
    }

    let cancelled = false
    const deadline = Date.now() + 10_000 // 10s max wait for targets

    const checkTargets = () => {
      if (cancelled) return

      const allReady = STEPS.every((step) => {
        if (typeof step.target !== 'string') return false
        return !!document.querySelector(step.target)
      })

      if (allReady) {
        setTargetsReady(true)
        setStepIndex(0)
        setRun(true)
        return
      }

      if (Date.now() >= deadline) {
        // Targets never appeared on this route — silently cancel the tour for this page.
        setTargetsReady(false)
        setRun(false)
        return
      }

      setTargetsReady(false)
      window.setTimeout(checkTargets, 100)
    }

    window.setTimeout(checkTargets, 0)

    return () => {
      cancelled = true
      setRun(false)
    }
  }, [enabled])

  const handleEvent = useCallback(
    (data: EventData, controls: Controls) => {
      const { status, action, index, type } = data

      if (
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED ||
        action === ACTIONS.CLOSE
      ) {
        localStorage.setItem(
          `openseo:onboarding-tour:done:${userId}`,
          '1',
        )
        setRun(false)
        onFinish?.()
        return
      }

      if (type === EVENTS.TARGET_NOT_FOUND) {
        setRun(false)
        return
      }

      if (type === EVENTS.STEP_AFTER) {
        if (action === ACTIONS.PREV) {
          setStepIndex(index - 1)
        } else if (index + 1 >= STEPS.length) {
          // Last step — finish the tour
          localStorage.setItem(`openseo:onboarding-tour:done:${userId}`, '1')
          setRun(false)
          onFinish?.()
        } else {
          setStepIndex(index + 1)
        }
      }
    },
    [userId, onFinish],
  )

  if (!enabled || !run || !targetsReady) return null

  return (
    <Joyride
      steps={STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      options={{
        primaryColor: 'hsl(221.2 83.2% 53.3%)',
        arrowColor: '#fff',
        backgroundColor: '#fff',
        overlayColor: 'rgba(0, 0, 0, 0.55)',
        textColor: '#1a1a2e',
        zIndex: 10000,
        showProgress: true,
        blockTargetInteraction: true,
        overlayClickAction: 'close',
        buttons: ['back', 'close', 'primary', 'skip'],
        spotlightRadius: 8,
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get started',
        next: 'Next',
        skip: 'Skip tour',
      }}
      styles={{
        tooltip: {
          borderRadius: '10px',
          fontSize: '14px',
          padding: '20px 24px',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: 600,
        },
        tooltipContent: {
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#64748b',
          padding: '12px 0 4px',
        },
        buttonPrimary: {
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          padding: '8px 18px',
        },
        buttonBack: {
          borderRadius: '6px',
          fontSize: '13px',
          color: '#64748b',
          marginRight: '8px',
        },
        buttonSkip: {
          fontSize: '12px',
          color: '#94a3b8',
        },
      }}
    />
  )
}
