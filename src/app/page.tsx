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
              <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[480px] drop-shadow-2xl">
                {/* Outer orbit rings */}
                <ellipse cx="240" cy="210" rx="220" ry="100" stroke="white" strokeOpacity="0.08" strokeWidth="1" />
                <ellipse cx="240" cy="210" rx="165" ry="75" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
                <ellipse cx="240" cy="210" rx="110" ry="50" stroke="white" strokeOpacity="0.15" strokeWidth="1" />

                {/* Central hub — document/content icon */}
                <rect x="208" y="170" width="64" height="80" rx="8" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
                <rect x="220" y="186" width="40" height="3" rx="1.5" fill="white" fillOpacity="0.7" />
                <rect x="220" y="195" width="32" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
                <rect x="220" y="204" width="36" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
                <rect x="220" y="213" width="28" height="3" rx="1.5" fill="white" fillOpacity="0.4" />
                <rect x="220" y="226" width="40" height="12" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.3" strokeWidth="1" />

                {/* Orbiting node — top: AI/brain */}
                <circle cx="240" cy="110" r="26" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
                <path d="M231 110c0-5 4-9 9-9s9 4 9 9" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="234" cy="107" r="1.5" fill="white" fillOpacity="0.8" />
                <circle cx="246" cy="107" r="1.5" fill="white" fillOpacity="0.8" />
                <path d="M234 115h12" stroke="white" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
                {/* Connector line to center */}
                <line x1="240" y1="136" x2="240" y2="170" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />

                {/* Orbiting node — right: SEO/search */}
                <circle cx="400" cy="185" r="26" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
                <circle cx="396" cy="182" r="8" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />
                <line x1="402" y1="188" x2="410" y2="196" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
                {/* Connector */}
                <line x1="374" y1="192" x2="272" y2="205" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />

                {/* Orbiting node — bottom-right: chart/analytics */}
                <circle cx="370" cy="300" r="26" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
                <rect x="358" y="296" width="5" height="14" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="366" y="290" width="5" height="20" rx="1" fill="white" fillOpacity="0.7" />
                <rect x="374" y="293" width="5" height="17" rx="1" fill="white" fillOpacity="0.6" />
                {/* Connector */}
                <line x1="348" y1="286" x2="265" y2="240" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />

                {/* Orbiting node — bottom-left: publish/send */}
                <circle cx="110" cy="300" r="26" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
                <path d="M100 300l14-8v5h10v6h-10v5z" fill="white" fillOpacity="0.7" />
                {/* Connector */}
                <line x1="132" y1="286" x2="215" y2="240" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />

                {/* Orbiting node — left: keywords/key */}
                <circle cx="80" cy="185" r="26" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
                <circle cx="76" cy="180" r="5" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />
                <line x1="80" y1="184" x2="88" y2="196" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="84" y1="190" x2="88" y2="188" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
                {/* Connector */}
                <line x1="106" y1="192" x2="208" y2="205" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />

                {/* Floating particles */}
                <circle cx="160" cy="130" r="3" fill="white" fillOpacity="0.15" />
                <circle cx="330" cy="140" r="2" fill="white" fillOpacity="0.2" />
                <circle cx="320" cy="260" r="2.5" fill="white" fillOpacity="0.12" />
                <circle cx="150" cy="260" r="2" fill="white" fillOpacity="0.18" />
                <circle cx="190" cy="160" r="1.5" fill="white" fillOpacity="0.1" />
                <circle cx="290" cy="160" r="1.5" fill="white" fillOpacity="0.1" />
                <circle cx="200" cy="320" r="2" fill="white" fillOpacity="0.1" />
                <circle cx="280" cy="320" r="2" fill="white" fillOpacity="0.1" />

                {/* Glow effect behind center */}
                <circle cx="240" cy="210" r="50" fill="white" fillOpacity="0.04" />
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
