'use client'

import { useState } from 'react'
import type { FAQContent } from '../../_lib/types'

interface Props {
  content: FAQContent
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        borderBottom: '1px solid #E8ECF0',
        background: open ? '#FFFFFF' : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '18px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 15,
          fontWeight: 600,
          color: '#1A1A1A',
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
          gap: 16,
        }}
      >
        <span style={{ flex: 1 }}>{question}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: open ? '#0078D4' : '#E8ECF0',
            color: open ? '#fff' : '#616161',
            fontSize: 16,
            fontWeight: 400,
            transition: 'all 0.25s ease',
            transform: open ? 'rotate(45deg)' : 'none',
            flexShrink: 0,
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 500 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          style={{
            padding: '0 20px 18px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#616161',
          }}
        >
          {answer}
        </div>
      </div>
    </div>
  )
}

export function FAQ({ content }: Props) {
  const items = content.items ?? (content as any).questions ?? []
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 4,
            height: 22,
            borderRadius: 2,
            background: '#0078D4',
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Frequently Asked Questions
        </h2>
      </div>
      <div
        style={{
          borderRadius: 12,
          background: '#F5F7FA',
          border: '1px solid #E1E1E1',
          overflow: 'hidden',
        }}
      >
        {items.map((item: { question: string; answer: string }, i: number) => (
          <FAQItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  )
}
