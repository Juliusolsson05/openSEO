import { ArrowRight } from 'lucide-react'
import { THEME } from '../theme'
import { AuroraLogo } from '@/components/brand/logo'
import Link from 'next/link'

export function CtaSlide() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center px-10 text-center"
      style={{
        background: `linear-gradient(135deg, ${THEME.colors.gradientStart} 0%, ${THEME.colors.gradientEnd} 100%)`,
        fontFamily: THEME.fonts.body,
      }}
    >
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <AuroraLogo size={40} light />

        <h2
          className="text-[26px] font-semibold leading-[1.15] text-white md:text-[36px]"
          style={{ letterSpacing: '-0.01em' }}
        >
          Your first post takes 5 minutes.
        </h2>

        <p className="max-w-[400px] text-[14px] leading-relaxed text-white/50">
          Sign up, paste your URL, pick a topic, and generate. That&apos;s it. Free for 14 days.
        </p>

        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold"
            style={{ background: '#FFFFFF', color: THEME.colors.primary, borderRadius: THEME.radii.sm }}
          >
            Generate your first post <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/example"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-white/70"
            style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: THEME.radii.sm }}
          >
            See a live example
          </Link>
        </div>

        <p className="mt-1 text-[11px] text-white/30">
          Free 14-day trial · No credit card · Takes 2 minutes to set up
        </p>
      </div>
    </div>
  )
}
