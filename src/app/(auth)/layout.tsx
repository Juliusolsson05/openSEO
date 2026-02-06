import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-sidebar items-center justify-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/15 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 shadow-2xl shadow-primary/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Aurora</h1>
          <p className="mt-2 text-sm text-sidebar-foreground/60 tracking-wide uppercase">by Nordtools</p>
          <p className="mt-6 text-[15px] leading-relaxed text-sidebar-foreground/70">
            AI-powered content engine. Generate, optimize, and publish blog content that ranks — on autopilot.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-[420px] animate-in">{children}</div>
      </div>
    </div>
  )
}
