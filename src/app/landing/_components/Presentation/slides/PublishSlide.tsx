import { Code2, CalendarDays, Download, Check } from 'lucide-react'
import { THEME } from '../theme'
import { AuroraLogo } from '@/components/brand/logo'

export function PublishSlide() {
  return (
    <div
      className="flex h-full items-center justify-center px-10"
      style={{ background: THEME.colors.surface, fontFamily: THEME.fonts.body }}
    >
      <div className="flex w-full max-w-[820px] items-center gap-12">
        <div className="flex-shrink-0" style={{ width: 260 }}>
          <div
            className="mb-3 inline-flex h-9 w-9 items-center justify-center"
            style={{ background: THEME.colors.primaryLight, color: THEME.colors.primary, borderRadius: THEME.radii.sm }}
          >
            <Code2 className="h-[18px] w-[18px]" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: THEME.colors.primary }}>
            Step 06
          </p>
          <h3 className="text-[22px] font-semibold md:text-[26px]" style={{ color: THEME.colors.foreground, letterSpacing: '-0.01em' }}>
            Push it live.
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: THEME.colors.muted }}>
            Send it to your CMS via API, download it, or schedule it for later. Your content, your workflow.
          </p>
        </div>

        {/* Right visual — publish options */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* API push card */}
          <div
            className="flex items-center gap-4 p-4"
            style={{ background: THEME.colors.surfaceSoft, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radii.md }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: THEME.colors.primaryLight, color: THEME.colors.primary, borderRadius: THEME.radii.sm }}
            >
              <Code2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: THEME.colors.foreground }}>Publishing API</p>
              <p className="text-[11px]" style={{ color: THEME.colors.muted }}>POST to WordPress, headless CMS, or any endpoint</p>
            </div>
            <div
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold"
              style={{ background: THEME.colors.successLight, color: THEME.colors.success, borderRadius: THEME.radii.sm }}
            >
              <Check className="h-3 w-3" /> Connected
            </div>
          </div>

          {/* Schedule card */}
          <div
            className="flex items-center gap-4 p-4"
            style={{ background: THEME.colors.surfaceSoft, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radii.md }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: THEME.colors.warningLight, color: THEME.colors.warningFg, borderRadius: THEME.radii.sm }}
            >
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: THEME.colors.foreground }}>Schedule</p>
              <p className="text-[11px]" style={{ color: THEME.colors.muted }}>Set a date. Aurora publishes it when the time comes.</p>
            </div>
            <span className="text-[10px] font-medium" style={{ color: THEME.colors.mutedLight }}>Feb 12, 09:00</span>
          </div>

          {/* Download card */}
          <div
            className="flex items-center gap-4 p-4"
            style={{ background: THEME.colors.surfaceSoft, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radii.md }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ background: THEME.colors.surfaceAlt, color: THEME.colors.muted, borderRadius: THEME.radii.sm }}
            >
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: THEME.colors.foreground }}>Download</p>
              <p className="text-[11px]" style={{ color: THEME.colors.muted }}>Export as HTML, Markdown, or JSON</p>
            </div>
            <span className="text-[10px] font-medium" style={{ color: THEME.colors.mutedLight }}>3 formats</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            <AuroraLogo size={12} />
            <span className="text-[10px]" style={{ color: THEME.colors.mutedLight }}>Powered by Aurora</span>
          </div>
        </div>
      </div>
    </div>
  )
}
