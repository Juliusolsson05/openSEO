import { THEME } from '../theme'
import { AuroraLogo } from '@/components/brand/logo'

export function TitleSlide() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center px-10 text-center"
      style={{
        background: `linear-gradient(135deg, ${THEME.colors.gradientStart} 0%, ${THEME.colors.gradientEnd} 100%)`,
        fontFamily: THEME.fonts.body,
      }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.00)_50%)]" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <AuroraLogo size={48} light />

        <h2
          className="text-[28px] font-semibold leading-[1.15] text-white md:text-[40px]"
          style={{ letterSpacing: '-0.02em', maxWidth: 520 }}
        >
          You tell us the topic.
          <br />
          We write the blog post.
        </h2>

        <p className="max-w-[400px] text-[14px] leading-relaxed text-white/50">
          Aurora turns a single title into a full, SEO-optimized blog post — complete with FAQs, images, tables, and internal links.
        </p>

        <div
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-medium text-white/70"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: THEME.radii.sm,
          }}
        >
          Swipe through to see how →
        </div>
      </div>
    </div>
  )
}
