'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Globe,
  Layers,
  Users,
  Check,
  Sparkles,
  ChevronRight,
  Quote,
} from 'lucide-react'
import { useState } from 'react'

const ACCENT = {
  bg: 'bg-blue-600',
  bgHover: 'hover:bg-blue-700',
  bgSoft: 'bg-blue-50',
  text: 'text-blue-600',
  textLight: 'text-blue-500',
  border: 'border-blue-600',
  ring: 'ring-blue-600',
}

/* ── Hero ─────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="max-w-2xl">
          <Link
            href="#"
            className={`mb-6 inline-flex items-center gap-1.5 rounded-full ${ACCENT.bgSoft} border border-blue-100 px-3 py-1 text-[12px] font-medium ${ACCENT.text} hover:border-blue-200 transition-colors`}
          >
            Now in public beta — free for 14 days
            <ChevronRight className="h-3 w-3" />
          </Link>

          <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-neutral-900 md:text-[56px]">
            Build products,{' '}
            <span className={ACCENT.textLight}>not infrastructure.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-neutral-500">
            The platform for modern teams to ship, measure, and iterate — without
            managing the complexity underneath.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/example/blog"
              className={`relative inline-flex items-center gap-2 rounded-lg ${ACCENT.bg} ${ACCENT.bgHover} px-5 py-2.5 text-[13px] font-medium text-white transition-colors shadow-sm`}
            >
              <span className="absolute -inset-2 rounded-xl bg-blue-500 animate-ping opacity-20" />
              <span className="absolute -inset-1 rounded-lg bg-blue-400 animate-pulse opacity-15" />
              {/* Circling border */}
              <span className="absolute -inset-[3px] rounded-[11px] overflow-hidden">
                <span className="absolute inset-0 animate-spin [animation-duration:2.5s]"
                  style={{ background: 'conic-gradient(from 0deg, transparent 40%, rgba(147,197,253,0.9) 70%, white 90%, transparent 100%)' }}
                />
              </span>
              <span className="absolute inset-[1.5px] rounded-[9px] bg-blue-600" />
              <span className="relative flex items-center gap-2">Go to blog <ArrowRight className="h-3.5 w-3.5" /></span>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              How it works
            </a>
          </div>

          <p className="mt-6 text-[12px] text-neutral-400">
            No credit card required · Set up in 2 minutes
          </p>
        </div>

        <div className="mt-16 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg shadow-neutral-200/50">
          <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-4 py-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-300" />
            <div className="ml-4 h-5 w-52 rounded-md bg-neutral-200/70" />
          </div>
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-3 border-r border-neutral-100 bg-neutral-50/50 p-4 space-y-1">
              {[
                { name: 'Dashboard', active: true },
                { name: 'Projects', active: false },
                { name: 'Analytics', active: false },
                { name: 'Team', active: false },
                { name: 'Settings', active: false },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`rounded-md px-3 py-1.5 text-[12px] transition-colors ${
                    item.active
                      ? `${ACCENT.bg} text-white font-medium`
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {item.name}
                </div>
              ))}
            </div>
            <div className="col-span-9 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="h-5 w-28 rounded bg-neutral-200" />
                <div className={`h-7 w-24 rounded-md ${ACCENT.bgSoft}`} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Revenue', value: '$12.4k', pct: 72, color: 'bg-blue-400' },
                  { label: 'Users', value: '1,429', pct: 58, color: 'bg-emerald-400' },
                  { label: 'Uptime', value: '99.98%', pct: 99, color: 'bg-amber-400' },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border border-neutral-100 bg-white p-4">
                    <p className="text-[11px] text-neutral-400 uppercase tracking-wide">{card.label}</p>
                    <p className="mt-1 text-[18px] font-semibold text-neutral-900">{card.value}</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100">
                      <div className={`h-1.5 rounded-full ${card.color}`} style={{ width: `${card.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-1.5">
                {[
                  { status: 'bg-emerald-400', text: 'API Gateway', detail: 'Healthy' },
                  { status: 'bg-emerald-400', text: 'Database Cluster', detail: 'Healthy' },
                  { status: 'bg-amber-400', text: 'CDN Edge Nodes', detail: 'Degraded' },
                  { status: 'bg-emerald-400', text: 'Auth Service', detail: 'Healthy' },
                ].map((row) => (
                  <div key={row.text} className="flex items-center gap-3 rounded-md border border-neutral-100 px-4 py-2.5">
                    <div className={`h-2 w-2 rounded-full ${row.status}`} />
                    <span className="text-[13px] text-neutral-700">{row.text}</span>
                    <span className="ml-auto text-[12px] text-neutral-400">{row.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[12px] font-medium uppercase tracking-widest text-neutral-400">
            Trusted by teams at
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['Vercel', 'Stripe', 'Notion', 'Linear', 'Raycast'].map((name) => (
              <span key={name} className="text-[16px] font-semibold text-neutral-300 tracking-tight select-none">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Features ─────────────────────────────────────────────── */

const features = [
  {
    icon: Zap,
    title: 'Fast by default',
    text: 'Sub-50ms responses on a global edge network. No cold starts, no config needed.',
  },
  {
    icon: BarChart3,
    title: 'Built-in analytics',
    text: 'Real-time dashboards for every metric that matters. No third-party scripts.',
  },
  {
    icon: Shield,
    title: 'Security-first',
    text: 'SOC 2 Type II certified. Data encrypted at rest and in transit, always.',
  },
  {
    icon: Globe,
    title: 'Multi-region',
    text: 'Deploy to 30+ regions with one click. Automatic failover and geo-routing.',
  },
  {
    icon: Layers,
    title: 'Modular by design',
    text: 'Auth, billing, storage, messaging — use what you need, skip what you don\'t.',
  },
  {
    icon: Users,
    title: 'Team-ready',
    text: 'Roles, permissions, audit logs, and shared workspaces out of the box.',
  },
]

function Features() {
  return (
    <section id="features" className="border-t border-neutral-100 bg-neutral-50/50 py-20 md:py-28">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="text-center max-w-xl mx-auto">
          <p className={`text-[12px] font-semibold uppercase tracking-widest ${ACCENT.text}`}>
            Features
          </p>
          <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-neutral-900 md:text-[36px]">
            Everything ships with the platform.
          </h2>
          <p className="mt-3 text-[15px] text-neutral-500">
            Stop stitching tools together. One platform, one bill, one place to build.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 hover:shadow-md hover:border-neutral-300 transition-all"
            >
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${ACCENT.bgSoft} ${ACCENT.text}`}>
                <f.icon className="h-[18px] w-[18px]" />
              </div>
              <h3 className="text-[15px] font-semibold text-neutral-900">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Stats ────────────────────────────────────────────────── */

function Stats() {
  const stats = [
    { value: '99.99%', label: 'Uptime SLA' },
    { value: '<50ms', label: 'Avg. response time' },
    { value: '2,400+', label: 'Teams using the platform' },
    { value: '30+', label: 'Regions worldwide' },
  ]

  return (
    <section className={`${ACCENT.bg} py-14`}>
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[28px] font-bold text-white md:text-[32px]">{s.value}</p>
              <p className="mt-1 text-[13px] text-blue-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Pricing ──────────────────────────────────────────────── */

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    desc: 'For side projects and prototypes.',
    features: ['3 team members', '10k API calls/mo', 'Community support', '1 region'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo per seat',
    desc: 'For teams shipping to production.',
    features: ['20 team members', '1M API calls/mo', 'Priority support', '5 regions', 'Advanced analytics', 'Custom domain'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For organizations at scale.',
    features: ['Unlimited seats', 'Unlimited API calls', 'Dedicated support', '30+ regions', 'SSO & SAML', 'SLA & BAA'],
    cta: 'Contact sales',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="border-t border-neutral-100 py-20 md:py-28">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="text-center max-w-xl mx-auto">
          <p className={`text-[12px] font-semibold uppercase tracking-widest ${ACCENT.text}`}>
            Pricing
          </p>
          <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-neutral-900 md:text-[36px]">
            Simple, honest pricing.
          </h2>
          <p className="mt-3 text-[15px] text-neutral-500">
            No hidden fees. Scale when you need to. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-7 transition-all ${
                plan.highlight
                  ? `${ACCENT.border} ring-1 ${ACCENT.ring} shadow-lg`
                  : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className={`absolute -top-3 left-6 rounded-full ${ACCENT.bg} px-3 py-0.5 text-[11px] font-semibold text-white`}>
                  Most popular
                </div>
              )}

              <p className="text-[14px] font-semibold text-neutral-900">{plan.name}</p>
              <p className="mt-0.5 text-[13px] text-neutral-400">{plan.desc}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-[32px] font-semibold tracking-tight text-neutral-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-[13px] text-neutral-400">{plan.period}</span>
                )}
              </div>

              <Link
                href="/example/blog"
                className={`mt-6 block rounded-lg py-2.5 text-center text-[13px] font-medium transition-colors ${
                  plan.highlight
                    ? `${ACCENT.bg} text-white ${ACCENT.bgHover}`
                    : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Go to blog
              </Link>

              <ul className="mt-6 space-y-2.5 border-t border-neutral-100 pt-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-neutral-600">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${plan.highlight ? ACCENT.text : 'text-neutral-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Customers ────────────────────────────────────────────── */

const testimonials = [
  {
    quote: 'We migrated our entire stack in a weekend. The developer experience is unmatched.',
    name: 'Sarah Chen',
    role: 'CTO, Flowbase',
  },
  {
    quote: 'Deploy times went from 12 minutes to 40 seconds. That\'s not hyperbole.',
    name: 'Marcus Rivera',
    role: 'Lead Engineer, Stackly',
  },
  {
    quote: 'Finally a platform that doesn\'t make me choose between moving fast and staying secure.',
    name: 'Lena Johansson',
    role: 'VP Engineering, Nordly',
  },
]

function Customers() {
  return (
    <section id="customers" className="border-t border-neutral-100 bg-neutral-50/50 py-20 md:py-28">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="text-center max-w-xl mx-auto">
          <p className={`text-[12px] font-semibold uppercase tracking-widest ${ACCENT.text}`}>
            Customers
          </p>
          <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-neutral-900 md:text-[36px]">
            Teams ship faster with us.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-neutral-200 bg-white p-7 hover:shadow-md transition-all"
            >
              <Quote className={`h-5 w-5 ${ACCENT.textLight} mb-4 opacity-60`} />
              <p className="text-[14px] leading-relaxed text-neutral-600">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${ACCENT.bgSoft} text-[13px] font-semibold ${ACCENT.text}`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-[12px] text-neutral-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Blog preview ─────────────────────────────────────────── */

function BlogPreview() {
  const posts = [
    {
      title: 'How We Reduced P99 Latency by 80%',
      tag: 'Engineering',
      date: 'Jan 2026',
      desc: 'The infrastructure decisions and trade-offs behind our latest performance milestone.',
    },
    {
      title: 'Introducing Multi-Region Deploys',
      tag: 'Product',
      date: 'Dec 2025',
      desc: 'One-click deploys to 30 regions. How we built automatic failover into the platform.',
    },
    {
      title: 'Zero-Downtime Migrations at Scale',
      tag: 'Engineering',
      date: 'Nov 2025',
      desc: 'Our approach to migrating live databases without taking systems offline.',
    },
  ]

  return (
    <section id="blog" className="border-t border-neutral-100 py-20 md:py-28">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className={`text-[12px] font-semibold uppercase tracking-widest ${ACCENT.text}`}>Blog</p>
            <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-neutral-900 md:text-[36px]">
              From the team
            </h2>
          </div>
          <Link href="/example/blog" className={`hidden md:inline-flex items-center gap-1.5 text-[13px] font-medium ${ACCENT.text} hover:underline`}>
            Go to blog <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="group cursor-pointer">
              <div className="mb-4 aspect-[16/9] rounded-lg border border-neutral-200 bg-neutral-100 overflow-hidden">
                <div className="h-full w-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-neutral-300" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`rounded-full ${ACCENT.bgSoft} px-2 py-0.5 text-[11px] font-medium ${ACCENT.text}`}>
                  {post.tag}
                </span>
                <span className="text-[11px] text-neutral-400">{post.date}</span>
              </div>
              <h3 className={`text-[15px] font-semibold text-neutral-900 group-hover:${ACCENT.text} transition-colors`}>
                {post.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                {post.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ──────────────────────────────────────────────────── */

function CTA() {
  return (
    <section className="border-t border-neutral-100 bg-neutral-900 py-24 md:py-32">
      <div className="mx-auto max-w-[1120px] px-6 text-center">
        <div className={`mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${ACCENT.bgSoft}`}>
          <Sparkles className={`h-7 w-7 ${ACCENT.text}`} />
        </div>
        <h2 className="text-[32px] font-semibold tracking-tight text-white md:text-[48px]">
          Read our blog
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-neutral-400">
          Guides, comparisons, and real-world insights to help your team work smarter. All content generated by OpenSEO.
        </p>
        <Link
          href="/example/blog"
          className={`mt-10 inline-flex items-center gap-2.5 rounded-xl ${ACCENT.bg} ${ACCENT.bgHover} px-8 py-4 text-[15px] font-semibold text-white transition-colors shadow-lg shadow-blue-600/25`}
        >
          Go to blog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/* ── Aurora Banner Modal ──────────────────────────────────── */

function AuroraBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <h2 className="text-lg font-semibold text-neutral-900">
          Example Website
        </h2>

        <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">
          This is an example website that showcases content completely generated
          by our SaaS. Click the <strong className="text-neutral-900">Blog</strong> and{' '}
          <strong className="text-neutral-900">Dictionary</strong> pages to explore
          how our content looks in real environments.
        </p>

        <button
          onClick={() => setVisible(false)}
          className={`mt-6 inline-flex items-center gap-2 rounded-lg ${ACCENT.bg} ${ACCENT.bgHover} px-5 py-2.5 text-[13px] font-medium text-white transition-colors`}
        >
          Explore the site <ArrowRight className="h-3.5 w-3.5" />
        </button>

        <p className="mt-4 text-[11px] text-neutral-400">
          Powered by OpenSEO
        </p>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <AuroraBanner />
      <Hero />
      <Features />
      <Stats />
      <Pricing />
      <Customers />
      <BlogPreview />
      <CTA />
    </div>
  )
}
