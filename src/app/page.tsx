import Link from 'next/link'
import { ArrowRight, BarChart3, CheckCircle2, PenSquare, Search, Send } from 'lucide-react'

import { AuroraLogo, AuroraWordmark } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: PenSquare,
    title: 'AI Blog Generation',
    description: 'Generate high-quality long-form drafts from a single prompt, tailored to your voice and audience.',
  },
  {
    icon: Search,
    title: 'SEO Optimization',
    description: 'Automatically structure content with keywords, headings, and readability improvements for better rankings.',
  },
  {
    icon: Send,
    title: 'Multi-channel Publishing',
    description: 'Publish to your blog and distribution channels from one workflow, with scheduling built in.',
  },
  {
    icon: BarChart3,
    title: 'Content Analytics',
    description: 'Track performance, identify winning topics, and refine your strategy with clear insights.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,#0078D4_0%,#0A8BEA_55%,#0078D4_100%)] text-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <header className="flex items-center justify-between">
            <AuroraWordmark light />
            <Button asChild variant="secondary" className="bg-white/15 text-white hover:bg-white/25">
              <Link href="/login">Sign in</Link>
            </Button>
          </header>

          <div className="grid gap-10 py-20 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-white/80">Aurora by Nordtools</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                AI-Powered Content Engine for teams that publish to win.
              </h1>
              <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
                Generate, optimize, and publish conversion-ready blog content at scale. Turn ideas into ranking posts in minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/login?callbackUrl=/blog">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-white/15 text-white hover:bg-white/25">
                  <Link href="/app/blog">See Demo</Link>
                </Button>
              </div>
            </div>

            {/* Decorative SVG illustration */}
            <div className="relative hidden md:flex items-center justify-center">
              <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[440px]">
                {/* Soft glow behind center */}
                <circle cx="220" cy="200" r="90" fill="white" fillOpacity="0.06" />
                <circle cx="220" cy="200" r="55" fill="white" fillOpacity="0.04" />

                {/* Orbit rings — tilted perspective */}
                <ellipse cx="220" cy="200" rx="200" ry="90" stroke="white" strokeOpacity="0.07" strokeWidth="1" />
                <ellipse cx="220" cy="200" rx="150" ry="68" stroke="white" strokeOpacity="0.1" strokeWidth="1" />

                {/* Connector lines — radiate from center */}
                <line x1="220" y1="165" x2="220" y2="105" stroke="white" strokeOpacity="0.18" strokeWidth="1" />
                <line x1="252" y1="188" x2="345" y2="148" stroke="white" strokeOpacity="0.18" strokeWidth="1" />
                <line x1="252" y1="212" x2="355" y2="275" stroke="white" strokeOpacity="0.18" strokeWidth="1" />
                <line x1="188" y1="212" x2="85" y2="275" stroke="white" strokeOpacity="0.18" strokeWidth="1" />
                <line x1="188" y1="188" x2="95" y2="148" stroke="white" strokeOpacity="0.18" strokeWidth="1" />

                {/* ── Central node: Aurora A logo ── */}
                <circle cx="220" cy="200" r="35" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                <path d="M220 180l-12 24h6l2-4h8l2 4h6l-12-24zm0 8l3 6h-6l3-6z" fill="white" fillOpacity="0.85" fillRule="evenodd" />

                {/* ── Top: Sparkle / AI ── */}
                <circle cx="220" cy="80" r="24" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                {/* 4-point sparkle */}
                <path d="M220 70v20M210 80h20" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M214 74l12 12M226 74l-12 12" stroke="white" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />

                {/* ── Top-right: Search / SEO ── */}
                <circle cx="360" cy="135" r="24" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                <circle cx="356" cy="131" r="7" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />
                <line x1="361" y1="136" x2="369" y2="144" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />

                {/* ── Bottom-right: Bar chart / Analytics ── */}
                <circle cx="370" cy="285" r="24" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                <rect x="359" y="283" width="4" height="12" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="366" y="278" width="4" height="17" rx="1" fill="white" fillOpacity="0.75" />
                <rect x="373" y="281" width="4" height="14" rx="1" fill="white" fillOpacity="0.6" />

                {/* ── Bottom-left: Globe / Publish ── */}
                <circle cx="70" cy="285" r="24" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                <circle cx="70" cy="285" r="10" stroke="white" strokeOpacity="0.7" strokeWidth="1.2" fill="none" />
                <ellipse cx="70" cy="285" rx="4" ry="10" stroke="white" strokeOpacity="0.45" strokeWidth="1" fill="none" />
                <line x1="60" y1="285" x2="80" y2="285" stroke="white" strokeOpacity="0.35" strokeWidth="1" />

                {/* ── Top-left: Tag / Keywords ── */}
                <circle cx="80" cy="135" r="24" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                <rect x="70" y="128" width="14" height="10" rx="2" stroke="white" strokeOpacity="0.75" strokeWidth="1.3" fill="none" />
                <line x1="84" y1="133" x2="90" y2="133" stroke="white" strokeOpacity="0.75" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="75" cy="133" r="1.5" fill="white" fillOpacity="0.7" />

                {/* Floating dots */}
                <circle cx="155" cy="120" r="2.5" fill="white" fillOpacity="0.15" />
                <circle cx="295" cy="110" r="2" fill="white" fillOpacity="0.12" />
                <circle cx="310" cy="240" r="2" fill="white" fillOpacity="0.15" />
                <circle cx="130" cy="250" r="2.5" fill="white" fillOpacity="0.1" />
                <circle cx="175" cy="310" r="2" fill="white" fillOpacity="0.08" />
                <circle cx="270" cy="300" r="1.5" fill="white" fillOpacity="0.1" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold">Everything you need to run content at scale</h2>
          <p className="mt-3 text-muted-foreground">From draft creation to performance insights, Aurora keeps your pipeline moving.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-sm border border-border bg-card p-5">
              <feature.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold">How it works</h2>
            <p className="mt-3 text-muted-foreground">A simple 3-step workflow for consistently shipping better content.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {['Create', 'Optimize', 'Publish'].map((step, index) => (
              <div key={step} className="rounded-sm border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{step}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step === 'Create' && 'Generate structured drafts in your brand tone from a prompt, keyword, or campaign goal.'}
                  {step === 'Optimize' && 'Enhance SEO, readability, and structure with AI recommendations before publishing.'}
                  {step === 'Publish' && 'Schedule and distribute content across channels, then measure what performs best.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { value: '10,000+', label: 'Blog posts generated' },
            { value: '3.2x', label: 'Average content output increase' },
            { value: '65%', label: 'Faster time to publish' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-sm border border-border bg-card p-6 text-center">
              <p className="text-3xl font-semibold text-primary">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold">Ready to scale your content engine?</h2>
          <p className="mt-3 text-muted-foreground">Join teams using Aurora to publish more, rank faster, and drive consistent organic growth.</p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/login?callbackUrl=/blog">
                Start with Aurora
                <CheckCircle2 className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <AuroraWordmark className="opacity-80" />
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Create account</Link>
            <Link href="/app/blog" className="hover:text-foreground">Demo</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
