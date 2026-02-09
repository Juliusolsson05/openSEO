'use client'

import { useState } from 'react'
import type { FAQContent } from '../../_lib/types'

interface Props {
  content: FAQContent
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid #F0F0F0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '14px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <span>{question}</span>
        <span style={{ fontSize: 14, color: '#616161', flexShrink: 0, marginLeft: 16, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 14, fontSize: 13, lineHeight: 1.6, color: '#616161' }}>
          {answer}
        </div>
      )}
    </div>
  )
}

export function FAQ({ content }: Props) {
  const items = content.items ?? (content as any).questions ?? []

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        Frequently Asked Questions
      </h2>
      <div style={{ borderTop: '1px solid #F0F0F0' }}>
        {items.map((item: { question: string; answer: string }, i: number) => (
          <FAQItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  )
}
