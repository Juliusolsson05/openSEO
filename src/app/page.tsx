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

            <div className="rounded-sm border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <AuroraLogo size={28} light />
                <p className="text-sm font-medium text-white/90">Generate → Optimize → Publish</p>
              </div>
              <div className="space-y-3 text-sm text-white/85">
                <p>• Build a full article from a title or keyword cluster</p>
                <p>• Improve readability and SEO with one click</p>
                <p>• Publish and track performance from a single dashboard</p>
              </div>
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
