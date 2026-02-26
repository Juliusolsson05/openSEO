import { Layers } from 'lucide-react'
import { THEME } from '../theme'

const ELEMENT_TYPES = [
  'Paragraph',
  'Introduction',
  'Conclusion',
  'FAQ',
  'Table',
  'List',
  'Numbered List',
  'Quote',
  'Code Block',
  'Image',
  'Call to Action',
  'Pros & Cons',
  'Timeline',
  'Checklist',
  'Statistics',
  'Case Study',
  'Product Recs',
  'Glossary',
  'Featured Snippet',
  'Versus',
]

export function ElementsSlide() {
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
            <Layers className="h-[18px] w-[18px]" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: THEME.colors.primary }}>
            Step 05
          </p>
          <h3 className="text-[22px] font-semibold md:text-[26px]" style={{ color: THEME.colors.foreground, letterSpacing: '-0.01em' }}>
            A blog post is more
            <br />
            than just text.
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7]" style={{ color: THEME.colors.muted }}>
            Aurora builds posts from 20+ element types. Each one is its own block — edit, rewrite, or swap without touching the rest.
          </p>
        </div>

        {/* Right visual — element tag cloud */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 justify-center">
            {ELEMENT_TYPES.map((el, i) => {
              // Alternate between two visual weights for variety
              const accent = i % 3 === 0
              return (
                <span
                  key={el}
                  className="px-3 py-2 text-[12px] font-medium"
                  style={{
                    border: `1px solid ${accent ? THEME.colors.primary : THEME.colors.border}`,
                    background: accent ? THEME.colors.primaryLight : THEME.colors.surface,
                    color: accent ? THEME.colors.primary : THEME.colors.foreground,
                    borderRadius: THEME.radii.sm,
                  }}
                >
                  {el}
                </span>
              )
            })}
          </div>
          <p className="mt-4 text-center text-[11px]" style={{ color: THEME.colors.mutedLight }}>
            Every element can be individually edited, regenerated, or enhanced
          </p>
        </div>
      </div>
    </div>
  )
}
