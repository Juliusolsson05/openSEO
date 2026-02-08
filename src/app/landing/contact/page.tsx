'use client'

import { StaticPageLayout } from '../_components/StaticPageLayout'
import { Mail, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

const heading = { color: '#1A1A1A', letterSpacing: '-0.01em' } as const
const muted = { color: '#616161' } as const

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <StaticPageLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#0078D4' }}>Contact</p>
      <h1 className="text-[28px] font-semibold leading-tight md:text-[34px]" style={heading}>
        Get in Touch
      </h1>
      <p className="text-[15px] leading-[1.7] mt-4 mb-10" style={muted}>
        Have a question, feedback, or need help? We&apos;d love to hear from you.
      </p>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Contact info */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 shrink-0 flex items-center justify-center" style={{ background: '#F0F6FF', borderRadius: 2 }}>
              <Mail className="h-4 w-4" style={{ color: '#0078D4' }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>General</p>
              <a href="mailto:hello@nordtools.com" className="text-[13px]" style={{ color: '#0078D4' }}>hello@nordtools.com</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 shrink-0 flex items-center justify-center" style={{ background: '#F0F6FF', borderRadius: 2 }}>
              <Mail className="h-4 w-4" style={{ color: '#0078D4' }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>Support</p>
              <a href="mailto:support@nordtools.com" className="text-[13px]" style={{ color: '#0078D4' }}>support@nordtools.com</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 shrink-0 flex items-center justify-center" style={{ background: '#F0F6FF', borderRadius: 2 }}>
              <MapPin className="h-4 w-4" style={{ color: '#0078D4' }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>Office</p>
              <p className="text-[13px]" style={muted}>Stockholm, Sweden</p>
            </div>
          </div>

          {/* Social links placeholder */}
          <div className="pt-4" style={{ borderTop: '1px solid #E6E6E6' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#A0A0A0' }}>Follow us</p>
            <div className="flex gap-3">
              {['Twitter', 'LinkedIn', 'GitHub'].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="px-3 py-1.5 text-[12px] font-medium"
                  style={{ border: '1px solid #E1E1E1', color: '#616161', borderRadius: 2 }}
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="p-8 text-center" style={{ background: '#F0F6FF', borderRadius: 4 }}>
              <div className="inline-flex h-10 w-10 items-center justify-center mb-3" style={{ background: '#DEECF9', borderRadius: 2 }}>
                <Send className="h-5 w-5" style={{ color: '#0078D4' }} />
              </div>
              <h3 className="text-[16px] font-semibold mb-1" style={{ color: '#1A1A1A' }}>Message sent!</h3>
              <p className="text-[13px]" style={muted}>Thanks for reaching out. We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full px-3 py-2 text-[13px] outline-none"
                  style={{ border: '1px solid #E1E1E1', borderRadius: 2, color: '#1A1A1A' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0078D4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E1E1E1'}
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 text-[13px] outline-none"
                  style={{ border: '1px solid #E1E1E1', borderRadius: 2, color: '#1A1A1A' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0078D4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E1E1E1'}
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1A1A1A' }}>Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full px-3 py-2 text-[13px] outline-none resize-none"
                  style={{ border: '1px solid #E1E1E1', borderRadius: 2, color: '#1A1A1A' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0078D4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E1E1E1'}
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white"
                style={{ background: '#0078D4', borderRadius: 2 }}
              >
                <Send className="h-3.5 w-3.5" />
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </StaticPageLayout>
  )
}
