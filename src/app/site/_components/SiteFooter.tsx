import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-16">
      <div className="mx-auto max-w-[1080px] px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[12px] text-neutral-500">© {new Date().getFullYear()} Nordtools</p>
        <div className="flex items-center gap-4 text-[12px] text-neutral-500">
          <Link href="/landing" className="hover:text-blue-600">Landing</Link>
          <Link href="/site/blog" className="hover:text-blue-600">Blog</Link>
          <Link href="/site/dictionary" className="hover:text-blue-600">Dictionary</Link>
        </div>
      </div>
    </footer>
  )
}
