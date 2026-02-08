import { Wand2, ArrowRight } from 'lucide-react'
import { THEME } from '../theme'

const TITLES = [
  { title: '10 Best Practices for Cloud Security in 2026', selected: false },
  { title: 'How to Implement Zero Trust Architecture', selected: false },
  { title: 'The Complete Guide to API Rate Limiting', selected: true },
  { title: 'Understanding Kubernetes Network Policies', selected: false },
  { title: 'Why Your API Gateway Is Your First Line of Defense', selected: false },
]

export function GenerateSlide() {
  return (
    <div
      className="flex h-full items-center justify-center px-10"
      style={{ background: THEME.colors.surface, fontFamily: THEME.fonts.body }}
    >
      <div className="flex w-full max-w-[820px] items-center gap-12">
        {/* Left text */}
        <div className="flex-shrink-0" style={{ width: 260 }}>
          <div
            className="mb-3 inline-flex h-9 w-9 items-center justify-center"
            style={{ background: THEME.colors.primaryLight, color: THEME.colors.primary, borderRadius: THEME.radii.sm }}
          >
            <Wand2 className="h-[18px] w-[18px]" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: THEME.colors.primary }}>
            Step 02
          </p>
          <h3 className="text-[22px] font-semibold md:text-[26px]" style={{ color: THEME.colors.foreground, letterSpacing: '-0.01em' }}>
            Pick a title,
            <br />
            hit generate
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: THEME.colors.muted }}>
            Choose from AI-suggested topics or type your own. One click and you get a full post.
          </p>
        </div>

        {/* Right visual — title list */}
        <div className="flex-1 min-w-0">
          <div
            className="overflow-hidden"
            style={{ border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radii.md, background: THEME.colors.surfaceAlt }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${THEME.colors.border}`, background: THEME.colors.surface }}>
              <span className="text-[12px] font-semibold" style={{ color: THEME.colors.foreground }}>Suggested Titles</span>
              <span className="text-[11px]" style={{ color: THEME.colors.mutedLight }}>5 generated</span>
            </div>

            <div className="p-3 space-y-1.5">
              {TITLES.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5"
                  style={{
                    background: item.selected ? THEME.colors.primaryLight : THEME.colors.surface,
                    border: `1.5px solid ${item.selected ? THEME.colors.primary : THEME.colors.border}`,
                    borderRadius: THEME.radii.sm,
                    boxShadow: item.selected ? `0 0 0 3px ${THEME.colors.primary}15` : 'none',
                  }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      background: item.selected ? THEME.colors.primary : THEME.colors.surfaceSoft,
                      color: item.selected ? '#FFFFFF' : THEME.colors.mutedLight,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="flex-1 text-[12px] truncate"
                    style={{ color: THEME.colors.foreground, fontWeight: item.selected ? 600 : 400 }}
                  >
                    {item.title}
                  </span>
                  {item.selected && (
                    <div
                      className="flex shrink-0 items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-white"
                      style={{ background: THEME.colors.primary, borderRadius: THEME.radii.sm }}
                    >
                      Generate <ArrowRight className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
