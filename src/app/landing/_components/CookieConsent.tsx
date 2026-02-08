'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'aurora:cookies:accepted'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY)
      if (!accepted) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage unavailable
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif" }}
    >
      <div
        className="mx-auto max-w-[720px] px-6 py-3 mb-4 mx-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E1E1E1',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <p className="text-[12px] leading-[1.5]" style={{ color: '#616161' }}>
          We use cookies to improve your experience.{' '}
          <Link href="/landing/cookies" className="font-medium" style={{ color: '#0078D4' }}>
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/landing/cookies"
            className="text-[12px] font-medium"
            style={{ color: '#616161' }}
          >
            Manage
          </Link>
          <button
            onClick={accept}
            className="px-4 py-1.5 text-[12px] font-semibold text-white"
            style={{ background: '#0078D4', borderRadius: 2 }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
