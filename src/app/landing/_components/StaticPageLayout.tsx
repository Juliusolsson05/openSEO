/**
 * Simple content wrapper for static pages (privacy, terms, cookies, about).
 * Header and footer are now provided by the landing layout.
 */
export function StaticPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 md:py-16">
      <div className="mx-auto max-w-[720px] px-6">
        {children}
      </div>
    </div>
  )
}
