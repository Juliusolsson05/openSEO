import { FileText } from 'lucide-react'
import { THEME } from '../theme'

const ELEMENTS = [
  { type: 'Introduction', lines: 3 },
  { type: 'Table of Contents', lines: 0, items: ['What is API Rate Limiting?', 'Why Rate Limiting Matters', 'Common Algorithms', 'Implementation Guide'] },
  { type: 'Paragraph', lines: 4 },
  { type: 'Image', lines: 0, isImage: true },
  { type: 'FAQ Section', lines: 0, items: ['How do I choose a rate limit?', 'What happens when the limit is hit?'] },
  { type: 'Statistics', lines: 0, stat: { value: '73%', label: 'of API outages caused by unthrottled traffic' } },
  { type: 'Conclusion', lines: 2 },
]

export function FullPostSlide() {
  return (
    <div
      className="flex h-full items-center justify-center px-10"
      style={{ background: THEME.colors.surfaceAlt, fontFamily: THEME.fonts.body }}
    >
      <div className="flex w-full max-w-[820px] items-center gap-12">
        <div className="flex-shrink-0" style={{ width: 260 }}>
          <div
            className="mb-3 inline-flex h-9 w-9 items-center justify-center"
            style={{ background: THEME.colors.primaryLight, color: THEME.colors.primary, borderRadius: THEME.radii.sm }}
          >
            <FileText className="h-[18px] w-[18px]" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: THEME.colors.primary }}>
            Step 03
          </p>
          <h3 className="text-[22px] font-semibold md:text-[26px]" style={{ color: THEME.colors.foreground, letterSpacing: '-0.01em' }}>
            Not a draft.
            <br />
            A full blog post.
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: THEME.colors.muted }}>
            You get a complete post with intro, paragraphs, FAQs, images, tables, and a conclusion. Ready to publish.
          </p>
        </div>

        {/* Right visual — mock post */}
        <div className="flex-1 min-w-0">
          <div
            className="overflow-hidden"
            style={{ border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radii.md, background: THEME.colors.surface, maxHeight: 400 }}
          >
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${THEME.colors.border}` }}>
              <p className="text-[13px] font-semibold" style={{ color: THEME.colors.foreground }}>
                The Complete Guide to API Rate Limiting
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: THEME.colors.mutedLight }}>
                7 elements · 1,847 words · Score: 78
              </p>
            </div>

            <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 340 }}>
              {ELEMENTS.map((el, i) => (
                <div
                  key={i}
                  className="px-3 py-2.5"
                  style={{ background: THEME.colors.surfaceSoft, borderRadius: THEME.radii.sm, border: `1px solid ${THEME.colors.border}` }}
                >
                  <p className="text-[10px] font-semibold mb-1.5" style={{ color: THEME.colors.primary }}>
                    {el.type}
                  </p>

                  {el.lines > 0 && (
                    <div className="space-y-1">
                      {Array.from({ length: el.lines }).map((_, j) => (
                        <div
                          key={j}
                          className="h-[6px]"
                          style={{
                            background: THEME.colors.border,
                            borderRadius: 2,
                            width: j === el.lines - 1 ? '65%' : '100%',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {el.items && (
                    <div className="space-y-1">
                      {el.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full" style={{ background: THEME.colors.primary }} />
                          <span className="text-[10px]" style={{ color: THEME.colors.muted }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {el.isImage && (
                    <div
                      className="flex h-16 items-center justify-center text-[10px]"
                      style={{ background: THEME.colors.surfaceAlt, borderRadius: THEME.radii.sm, color: THEME.colors.mutedLight }}
                    >
                      Generated image placeholder
                    </div>
                  )}

                  {el.stat && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[20px] font-bold" style={{ color: THEME.colors.primary }}>{el.stat.value}</span>
                      <span className="text-[10px]" style={{ color: THEME.colors.muted }}>{el.stat.label}</span>
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
