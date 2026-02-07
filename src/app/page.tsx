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
/*  Tiny inline components (keep page self-contained)                 */
/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050A18]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <AuroraLogo size={26} light />
          <span className="text-[15px] font-semibold tracking-tight text-white">Aurora</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-white/60 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#how-it-works" className="transition hover:text-white">How it works</a>
          <a href="#metrics" className="transition hover:text-white">Results</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-medium text-white/70 transition hover:text-white">
            Sign in
          </Link>
          <Link
            href="/login?callbackUrl=/blog"
            className="rounded-lg bg-[#0078D4] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#1a86d9]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

function GridPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#0078D4]/20 blur-[120px]" />
      <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-[#6366f1]/10 blur-[100px]" />
      {/* Grid lines */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl px-6">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c1424] shadow-2xl shadow-[#0078D4]/10">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="ml-4 h-5 w-48 rounded bg-white/5" />
        </div>
        {/* Content */}
        <div className="flex">
          {/* Sidebar mock */}
          <div className="hidden w-48 shrink-0 border-r border-white/5 p-4 md:block">
            <div className="flex items-center gap-2 mb-6">
              <AuroraLogo size={18} light />
              <span className="text-[11px] font-semibold text-white/50">Aurora</span>
            </div>
            <div className="space-y-2">
              {['Blog Posts', 'Titles', 'Dictionary', 'Analytics', 'CTAs', 'Settings'].map((item, i) => (
                <div key={item} className={`rounded-md px-3 py-1.5 text-[11px] ${i === 0 ? 'bg-[#0078D4]/20 text-[#5BA8E8] font-medium' : 'text-white/30'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Main mock */}
          <div className="flex-1 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-5 w-32 rounded bg-white/10" />
              <div className="flex gap-2">
                <div className="h-7 w-20 rounded-md bg-white/5" />
                <div className="h-7 w-24 rounded-md bg-[#0078D4]/30" />
              </div>
            </div>
            {/* Cards grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {['12 Posts', '3 Drafts', '8 Published', '2.4k Views'].map((stat) => (
                <div key={stat} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] text-white/30 mb-1">metric</div>
                  <div className="text-[13px] font-semibold text-white/70">{stat}</div>
                </div>
              ))}
            </div>
            {/* Posts mock */}
            <div className="space-y-2">
              {[
                { title: 'How to Scale SaaS Content Operations', status: 'Published', color: '#10b981' },
                { title: 'Enterprise SEO Strategy for 2026', status: 'Draft', color: '#f59e0b' },
                { title: '10 AI Tools Transforming Marketing Teams', status: 'Published', color: '#10b981' },
                { title: 'The Future of Content Automation', status: 'Generating...', color: '#0078D4' },
              ].map((post) => (
                <div key={post.title} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                  <span className="text-[12px] text-white/50">{post.title}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: post.color, backgroundColor: `${post.color}15` }}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050A18] to-transparent" />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0078D4]/10 text-[#5BA8E8]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-white/50">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description, icon: Icon }: { number: string; title: string; description: string; icon: any }) {
  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0078D4] text-[15px] font-bold text-white">
          {number}
        </div>
        <div className="mt-3 h-full w-px bg-gradient-to-b from-white/10 to-transparent" />
      </div>
      <div className="pb-12">
        <div className="mb-1 flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#5BA8E8]" />
          <h3 className="text-[16px] font-semibold text-white">{title}</h3>
        </div>
        <p className="text-[14px] leading-relaxed text-white/50">{description}</p>
      </div>
    </div>
  )
}

function MetricCard({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0078D4]/10">
        <Icon className="h-5 w-5 text-[#5BA8E8]" />
      </div>
      <div className="text-[32px] font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-[13px] text-white/40">{label}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050A18] text-white antialiased">
      <Nav />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-32 pb-8">
        <GridPattern />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[12px] font-medium text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-[#0078D4]" />
            Now with GPT-5 &amp; Gemini 2.5 support
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4.25rem)] font-bold leading-[1.08] tracking-tight">
            The AI content engine{' '}
            <span className="bg-gradient-to-r from-[#0078D4] via-[#4f9cf7] to-[#8b5cf6] bg-clip-text text-transparent">
              built for scale
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/50">
            Aurora generates, optimizes, and publishes entire blog posts from a single title.
            Enterprise teams use it to 3x content output without adding headcount.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login?callbackUrl=/blog"
              className="group flex items-center gap-2 rounded-xl bg-[#0078D4] px-6 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-[#0078D4]/25 transition hover:bg-[#1a86d9] hover:shadow-[#0078D4]/40"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-[14px] font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10"
            >
              Live demo
            </Link>
          </div>
        </div>
        <DashboardMockup />
      </section>

      {/* ─── LOGO BAR ─── */}
      <section className="relative border-y border-white/5 py-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/25">Trusted by content teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[15px] font-semibold tracking-tight text-white/20">
            {['Klarna', 'Volvo', 'Spotify', 'Telia', 'H&M', 'Ericsson'].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5BA8E8]">Platform</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight">
              Everything you need to dominate organic
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/40">
              From AI generation to keyword optimization to one-click publishing — Aurora handles the entire content lifecycle.
            </p>
          </div>

          {/* Bento grid */}
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
      <section id="how-it-works" className="relative overflow-hidden py-28">
        <div className="pointer-events-none absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#0078D4]/5 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5BA8E8]">Workflow</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight">
              From idea to published in minutes
            </h2>
          </div>
          <div>
            <StepCard number="1" icon={PenTool} title="Add your titles" description="Import a keyword list, generate titles with AI, or add them manually. Aurora creates structured SEO-optimized titles with focus keywords." />
            <StepCard number="2" icon={Sparkles} title="Generate & refine" description="Hit generate and watch Aurora produce full blog posts with 10-15 rich elements — introductions, FAQs, tables, statistics, and more. Edit inline or let the AI enhance." />
            <StepCard number="3" icon={Send} title="Publish everywhere" description="One click to push to WordPress. Schedule across your content calendar, assign to bulk campaigns, and track performance from the analytics dashboard." />
          </div>
        </div>
      </section>

      {/* ─── METRICS ─── */}
      <section id="metrics" className="border-y border-white/5 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5BA8E8]">Impact</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight">
              Numbers that speak for themselves
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <MetricCard value="10k+" label="Posts generated" icon={Newspaper} />
            <MetricCard value="3.2x" label="Content velocity" icon={Zap} />
            <MetricCard value="65%" label="Faster to publish" icon={BookOpen} />
            <MetricCard value="40%" label="More organic traffic" icon={BarChart3} />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative overflow-hidden py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0078D4]/10 blur-[150px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight">
            Ready to scale your content?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/45">
            Join the teams publishing 3x more content with Aurora. Start generating enterprise-quality blog posts in minutes, not days.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login?callbackUrl=/blog"
              className="group flex items-center gap-2 rounded-xl bg-[#0078D4] px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-[#0078D4]/25 transition hover:bg-[#1a86d9] hover:shadow-[#0078D4]/40"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-white/25">No credit card required · Free plan available</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <AuroraLogo size={22} light />
            <span className="text-[13px] font-semibold text-white/40">Aurora by Nordtools</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-white/30">
            <Link href="/login" className="transition hover:text-white/60">Sign in</Link>
            <Link href="/register" className="transition hover:text-white/60">Create account</Link>
            <Link href="/blog" className="transition hover:text-white/60">Demo</Link>
          </div>
          <p className="text-[11px] text-white/20">© {new Date().getFullYear()} Nordtools AB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
