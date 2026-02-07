import Link from 'next/link'
import { Zap } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-100 py-10">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/example" className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
                <Zap className="h-3 w-3 text-white" />
              </div>
              Awesome SaaS
            </Link>
            <p className="mt-3 text-[12px] leading-relaxed text-neutral-400">
              The platform for modern product teams. Ship faster, scale smarter.
            </p>
          </div>

          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Docs'] },
            { title: 'Company', links: ['About', 'Blog', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-neutral-400">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-neutral-500 transition-colors hover:text-neutral-900">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-100 pt-6 text-[12px] text-neutral-400">
          © {new Date().getFullYear()} Awesome SaaS, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
