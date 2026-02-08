import { Globe, Check } from 'lucide-react'
import { THEME } from '../theme'

export function ConnectSlide() {
  return (
    <div
      className="flex h-full items-center justify-center px-10"
      style={{ background: THEME.colors.surface, fontFamily: THEME.fonts.body }}
    >
      <div className="flex w-full max-w-[820px] items-center gap-12">
        {/* Left text */}
        <div className="flex-1 min-w-0">
          <div
            className="mb-3 inline-flex h-9 w-9 items-center justify-center"
            style={{ background: THEME.colors.primaryLight, color: THEME.colors.primary, borderRadius: THEME.radii.sm }}
          >
            <Globe className="h-[18px] w-[18px]" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: THEME.colors.primary }}>
            Step 01
          </p>
          <h3 className="text-[22px] font-semibold md:text-[26px]" style={{ color: THEME.colors.foreground, letterSpacing: '-0.01em' }}>
            Connect your website
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: THEME.colors.muted }}>
            Paste your URL. Aurora reads your site, figures out your industry, and knows what to write about.
          </p>

          <div className="mt-4 space-y-1.5">
            {['Auto-detects your niche', 'Learns your brand voice', 'Takes under 30 seconds'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" style={{ color: THEME.colors.success }} />
                <span className="text-[12px]" style={{ color: THEME.colors.muted }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual — URL input mock */}
        <div className="flex-1 min-w-0">
          <div
            className="overflow-hidden"
            style={{ border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radii.md, background: THEME.colors.surfaceAlt }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: THEME.colors.surfaceSoft, borderBottom: `1px solid ${THEME.colors.border}` }}>
              <div className="h-2 w-2 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="h-2 w-2 rounded-full" style={{ background: '#FEBC2E' }} />
              <div className="h-2 w-2 rounded-full" style={{ background: '#28C840' }} />
            </div>

            <div className="p-5 space-y-4">
              <p className="text-[13px] font-semibold" style={{ color: THEME.colors.foreground }}>
                What&apos;s your website?
              </p>
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ background: THEME.colors.surface, border: `1.5px solid ${THEME.colors.primary}`, borderRadius: THEME.radii.sm, boxShadow: `0 0 0 3px ${THEME.colors.primary}15` }}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: THEME.colors.mutedLight }} />
                <span className="text-[13px]" style={{ color: THEME.colors.foreground }}>
                  www.mystore.com
                  <span className="animate-pulse" style={{ color: THEME.colors.primary }}>|</span>
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Industry', value: 'E-commerce · Retail', done: true },
                  { label: 'Language', value: 'English (US)', done: true },
                  { label: 'Tone', value: 'Professional, friendly', done: true },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-3 py-2" style={{ background: THEME.colors.surface, borderRadius: THEME.radii.sm, border: `1px solid ${THEME.colors.border}` }}>
                    <span className="text-[11px]" style={{ color: THEME.colors.mutedLight }}>{row.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium" style={{ color: THEME.colors.foreground }}>{row.value}</span>
                      {row.done && <Check className="h-3 w-3" style={{ color: THEME.colors.success }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
