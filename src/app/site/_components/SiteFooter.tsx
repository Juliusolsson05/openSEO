import Link from 'next/link'
import { OpenSeoLogo } from '@/components/brand/logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-16">
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/landing" className="flex items-center gap-2">
              <OpenSeoLogo size={20} />
              <span className="text-[13px] font-semibold text-neutral-900">OpenSEO</span>
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
              AI-powered content generation.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Content</p>
            <ul className="space-y-1.5">
              <li><Link href="/site/blog" className="text-[12px] text-neutral-500 hover:text-blue-600">Blog</Link></li>
              <li><Link href="/site/dictionary" className="text-[12px] text-neutral-500 hover:text-blue-600">Dictionary</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Product</p>
            <ul className="space-y-1.5">
              <li><Link href="/landing#features" className="text-[12px] text-neutral-500 hover:text-blue-600">Features</Link></li>
              <li><Link href="/landing/compare" className="text-[12px] text-neutral-500 hover:text-blue-600">Compare</Link></li>
              <li><Link href="/example" className="text-[12px] text-neutral-500 hover:text-blue-600">Example Site</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Legal</p>
            <ul className="space-y-1.5">
              <li><Link href="/landing/privacy" className="text-[12px] text-neutral-500 hover:text-blue-600">Privacy</Link></li>
              <li><Link href="/landing/terms" className="text-[12px] text-neutral-500 hover:text-blue-600">Terms</Link></li>
              <li><Link href="/landing/cookies" className="text-[12px] text-neutral-500 hover:text-blue-600">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-neutral-400">© {new Date().getFullYear()} OpenSEO. All rights reserved.</p>
          <Link href="/sitemap.xml" className="text-[11px] text-neutral-400 hover:text-blue-600">Sitemap</Link>
        </div>
      </div>
    </footer>
  )
}
