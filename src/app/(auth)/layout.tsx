import Link from 'next/link'

import { AuroraLogo } from '@/components/brand/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left — Azure-style branding panel */}
      <div className="hidden lg:flex lg:w-[480px] azure-hero items-center justify-center relative overflow-hidden">
        {/* Premium geometric accents */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.00)_45%)]" />
        <div className="absolute -top-16 -right-20 h-64 w-64 rotate-12 border border-white/20 bg-white/5" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 -rotate-12 border border-white/15 bg-white/5" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative z-10 max-w-sm px-10 text-center">
          <div className="flex justify-center mb-6">
            <AuroraLogo size={56} light />
          </div>
          <h1 className="text-[28px] font-semibold text-white leading-tight">Aurora</h1>
          <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.15em] text-white/50">
            by Nordtools
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-white/70">
            AI-powered content engine. Generate, optimize, and publish blog content that ranks.
          </p>
        </div>
      </div>

      {/* Right — form area */}
      <div className="relative flex flex-1 items-center justify-center bg-white p-8">
        <Link
          href="/"
          className="absolute left-8 top-8 text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Link>
        <div className="w-full max-w-[380px] animate-in">{children}</div>
      </div>
    </div>
  )
}
