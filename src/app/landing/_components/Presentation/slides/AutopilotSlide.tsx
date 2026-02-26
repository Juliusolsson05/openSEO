import { Sparkles } from 'lucide-react'
import { THEME } from '../theme'

const BEFORE = [
  { type: 'Introduction' },
  { type: 'Paragraph' },
  { type: 'Conclusion' },
]

const AFTER = [
  { type: 'Introduction', tag: 'Enhanced', tagBg: THEME.colors.successLight, tagColor: THEME.colors.success },
  { type: 'Table of Contents', tag: 'New', tagBg: THEME.colors.primaryLight, tagColor: THEME.colors.primary },
  { type: 'Paragraph', tag: 'Enhanced', tagBg: THEME.colors.successLight, tagColor: THEME.colors.success },
  { type: 'FAQ Section', tag: 'New', tagBg: THEME.colors.primaryLight, tagColor: THEME.colors.primary },
  { type: 'Image', tag: 'New', tagBg: THEME.colors.primaryLight, tagColor: THEME.colors.primary },
  { type: 'Statistics', tag: 'New', tagBg: THEME.colors.primaryLight, tagColor: THEME.colors.primary },
  { type: 'Paragraph', tag: 'Enhanced', tagBg: THEME.colors.successLight, tagColor: THEME.colors.success },
  { type: 'Call to Action', tag: 'New', tagBg: THEME.colors.primaryLight, tagColor: THEME.colors.primary },
  { type: 'Conclusion', tag: 'Enhanced', tagBg: THEME.colors.successLight, tagColor: THEME.colors.success },
]

export function AutopilotSlide() {
  return (
    <div
      className="flex h-full items-center justify-center px-10"
      style={{ background: THEME.colors.surface, fontFamily: THEME.fonts.body }}
    >
      <div className="w-full max-w-[820px]">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="inline-flex h-9 w-9 items-center justify-center"
            style={{ background: THEME.colors.primaryLight, color: THEME.colors.primary, borderRadius: THEME.radii.sm }}
          >
            <Sparkles className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: THEME.colors.primary }}>
              Step 04
            </p>
            <h3 className="text-[20px] font-semibold md:text-[24px]" style={{ color: THEME.colors.foreground, letterSpacing: '-0.01em' }}>
              One click. Autopilot does the rest.
            </h3>
          </div>
        </div>

        {/* Before / After grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4" style={{ background: THEME.colors.surfaceSoft, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radii.md }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full" style={{ background: THEME.colors.warning }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: THEME.colors.mutedLight }}>
                Before Autopilot
              </span>
            </div>
            <div className="space-y-1.5">
              {BEFORE.map((el, i) => (
                <div key={i} className="px-3 py-2" style={{ background: THEME.colors.surface, borderRadius: THEME.radii.sm }}>
                  <p className="text-[10px] font-semibold mb-1" style={{ color: THEME.colors.mutedLight }}>{el.type}</p>
                  <div className="space-y-0.5">
                    <div className="h-[5px] w-full" style={{ background: THEME.colors.border, borderRadius: 1 }} />
                    <div className="h-[5px] w-4/5" style={{ background: THEME.colors.border, borderRadius: 1 }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center pt-3 text-[11px]" style={{ color: THEME.colors.mutedLight }}>
              3 elements · Score: <span className="font-semibold" style={{ color: THEME.colors.warningFg }}>62</span>
            </p>
          </div>

          <div className="p-4" style={{ background: THEME.colors.surface, border: `2px solid ${THEME.colors.primary}`, borderRadius: THEME.radii.md }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full" style={{ background: THEME.colors.success }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: THEME.colors.primary }}>
                After Autopilot
              </span>
            </div>
            <div className="space-y-1">
              {AFTER.map((el, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5" style={{ background: THEME.colors.surfaceSoft, borderRadius: THEME.radii.sm }}>
                  <span className="flex-1 text-[11px]" style={{ color: THEME.colors.foreground }}>{el.type}</span>
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-semibold"
                    style={{ background: el.tagBg, color: el.tagColor, borderRadius: THEME.radii.sm }}
                  >
                    {el.tag}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center pt-3 text-[11px] font-semibold" style={{ color: THEME.colors.primary }}>
              9 elements · Score: 94
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
