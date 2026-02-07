import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Globe,
  KeyRound,
  Layers,
  LineChart,
  Newspaper,
  PenTool,
  Search,
  Send,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { AuroraLogo } from '@/components/brand/logo'

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <AuroraLogo size={26} />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">Aurora</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#how-it-works" className="transition hover:text-foreground">How it works</a>
          <a href="#metrics" className="transition hover:text-foreground">Results</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-medium text-muted-foreground transition hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/login?callbackUrl=/blog"
            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl px-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-rose-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-4 h-5 w-48 rounded bg-secondary" />
        </div>
        <div className="flex">
          {/* Sidebar mock */}
          <div className="hidden w-48 shrink-0 border-r border-border bg-secondary/30 p-4 md:block">
            <div className="flex items-center gap-2 mb-6">
              <AuroraLogo size={18} />
              <span className="text-[11px] font-semibold text-muted-foreground">Aurora</span>
            </div>
            <div className="space-y-1">
              {['Blog Posts', 'Titles', 'Dictionary', 'Analytics', 'CTAs', 'Settings'].map((item, i) => (
                <div key={item} className={`rounded-md px-3 py-1.5 text-[11px] ${i === 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Main */}
          <div className="flex-1 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-5 w-32 rounded bg-secondary" />
              <div className="flex gap-2">
                <div className="h-7 w-20 rounded-md bg-secondary" />
                <div className="h-7 w-24 rounded-md bg-primary/15" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {['12 Posts', '3 Drafts', '8 Published', '2.4k Views'].map((stat) => (
                <div key={stat} className="rounded-lg border border-border p-3">
                  <div className="text-[10px] text-muted-foreground mb-1">metric</div>
                  <div className="text-[13px] font-semibold text-foreground">{stat}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { title: 'How to Scale SaaS Content Operations', status: 'Published', color: 'text-emerald-600 bg-emerald-50' },
                { title: 'Enterprise SEO Strategy for 2026', status: 'Draft', color: 'text-amber-600 bg-amber-50' },
                { title: '10 AI Tools Transforming Marketing Teams', status: 'Published', color: 'text-emerald-600 bg-emerald-50' },
                { title: 'The Future of Content Automation', status: 'Generating...', color: 'text-primary bg-primary/10' },
              ].map((post) => (
                <div key={post.title} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <span className="text-[12px] text-muted-foreground">{post.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${post.color}`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-32 pb-8">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Now with GPT-5 &amp; Gemini 2.5 support
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4.25rem)] font-bold leading-[1.08] tracking-tight text-foreground">
            The AI content engine{' '}
            <span className="text-primary">built for scale</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            Aurora generates, optimizes, and publishes entire blog posts from a single title.
            Enterprise teams use it to 3x content output without adding headcount.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login?callbackUrl=/blog"
              className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[14px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:shadow-primary/30"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-[14px] font-semibold text-foreground shadow-sm transition hover:bg-secondary/50"
            >
              Live demo
            </Link>
          </div>
        </div>

        <DashboardMockup />
      </section>

      {/* ─── LOGO BAR ─── */}
      <section className="border-y border-border py-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">Trusted by content teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[15px] font-semibold tracking-tight text-muted-foreground/30">
            {['Klarna', 'Volvo', 'Spotify', 'Telia', 'H&M', 'Ericsson'].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">Platform</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-foreground">
              Everything you need to dominate organic
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              From AI generation to keyword optimization to one-click publishing — Aurora handles the entire content lifecycle.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={BrainCircuit} title="AI-Powered Generation" description="Full blog posts from a single title. Structured with headings, lists, FAQs, tables, and 20+ element types — all SEO-ready." />
            <FeatureCard icon={KeyRound} title="Smart Keyword Linking" description="Automatic internal linking from your keyword dictionary. Every post gets contextual hyperlinks that boost domain authority." />
            <FeatureCard icon={Target} title="SEO Autopilot" description="Meta titles, descriptions, focus keywords, and readability scores — optimized automatically to hit Yoast green across the board." />
            <FeatureCard icon={Layers} title="20+ Content Elements" description="Paragraphs, FAQs, comparison tables, pros & cons, timelines, code blocks, statistics — mix and match for rich content." />
            <FeatureCard icon={Globe} title="One-Click Publishing" description="Push directly to WordPress via Elementor. Schedule posts, bulk-publish, and track what goes live from one dashboard." />
            <FeatureCard icon={LineChart} title="Performance Analytics" description="Track rankings, traffic, and content ROI. Identify winning topics and double down on what drives growth." />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="relative overflow-hidden border-y border-border bg-secondary/30 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">Workflow</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-foreground">
              From idea to published in minutes
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { num: '01', icon: PenTool, title: 'Add your titles', desc: 'Import a keyword list, generate titles with AI, or add them manually. Aurora creates structured SEO-optimized titles with focus keywords and meta descriptions.' },
              { num: '02', icon: Sparkles, title: 'Generate & refine', desc: 'Hit generate and watch Aurora produce full blog posts with 10-15 rich elements — introductions, FAQs, tables, statistics, and more. Edit inline or let the AI enhance.' },
              { num: '03', icon: Send, title: 'Publish everywhere', desc: 'One click to push to WordPress. Schedule across your content calendar, assign to bulk campaigns, and track performance from the analytics dashboard.' },
            ].map((step) => (
              <div key={step.num} className="relative rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground">
                    {step.num}
                  </div>
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-[17px] font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── METRICS ─── */}
      <section id="metrics" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">Impact</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-foreground">
              Numbers that speak for themselves
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: '10k+', label: 'Posts generated', icon: Newspaper },
              { value: '3.2x', label: 'Content velocity', icon: Zap },
              { value: '65%', label: 'Faster to publish', icon: BookOpen },
              { value: '40%', label: 'More organic traffic', icon: BarChart3 },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-[28px] font-bold tracking-tight text-foreground">{m.value}</div>
                <div className="mt-1 text-[13px] text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative overflow-hidden border-t border-border bg-primary py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight text-primary-foreground">
            Ready to scale your content?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-primary-foreground/70">
            Join the teams publishing 3x more content with Aurora. Start generating enterprise-quality blog posts in minutes, not days.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login?callbackUrl=/blog"
              className="group flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-semibold text-primary shadow-lg transition hover:bg-white/90"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-primary-foreground/40">No credit card required · Free plan available</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <AuroraLogo size={22} />
            <span className="text-[13px] font-semibold text-muted-foreground">Aurora by Nordtools</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-muted-foreground">
            <Link href="/login" className="transition hover:text-foreground">Sign in</Link>
            <Link href="/register" className="transition hover:text-foreground">Create account</Link>
            <Link href="/blog" className="transition hover:text-foreground">Demo</Link>
          </div>
          <p className="text-[11px] text-muted-foreground/50">© {new Date().getFullYear()} Nordtools AB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
