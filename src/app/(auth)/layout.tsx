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
        {/* Subtle diagonal accent */}
        <div className="absolute -right-24 -top-24 h-[500px] w-[500px] rounded-full bg-white/5" />
        <div className="absolute -left-12 -bottom-32 h-[400px] w-[400px] rounded-full bg-white/5" />

        <div className="relative z-10 max-w-sm px-10 text-center">
          <div className="mx-auto mb-6">
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
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-[380px] animate-in">{children}</div>
      </div>
    </div>
  )
}
