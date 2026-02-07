'use client'

import Link from 'next/link'
import {
  ArrowRight,
  FileText,
  Wand2,
  BarChart3,
  Globe,
  BookOpen,
  CalendarDays,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  Code2,
  Plug,
} from 'lucide-react'
import { useState } from 'react'
import { AuroraLogo } from '@/components/brand/logo'

/* ── Nav ──────────────────────────────────────────────────── */

function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full bg-white" style={{ borderBottom: '1px solid #E6E6E6' }}>
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-6">
        <Link href="/landing" className="flex items-center gap-2">
          <AuroraLogo size={22} />
          <span className="text-[14px] font-semibold" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>Aurora</span>
          <div className="hidden sm:block h-4 w-px mx-1" style={{ background: '#E1E1E1' }} />
          <span className="hidden sm:inline text-[11px]" style={{ color: '#A0A0A0' }}>by Nordtools</span>
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          {[
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Features', href: '#features' },
            { label: 'Example', href: '/example' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1 text-[13px]"
              style={{ color: '#616161' }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-[13px]" style={{ color: '#0078D4' }}>Sign in</Link>
          <Link
            href="/register"
            className="text-[13px] font-semibold text-white px-4 py-[6px]"
            style={{ background: '#0078D4', borderRadius: 2 }}
          >
            Try Aurora free
          </Link>
        </div>

        <button className="md:hidden" style={{ color: '#616161' }} onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="bg-white px-6 py-4 md:hidden" style={{ borderTop: '1px solid #E6E6E6' }}>
          {['How it works', 'Features'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setOpen(false)} className="block py-2 text-[13px]" style={{ color: '#616161' }}>{item}</a>
          ))}
          <Link href="/example" onClick={() => setOpen(false)} className="block py-2 text-[13px]" style={{ color: '#616161' }}>Example</Link>
          <Link href="/register" className="mt-3 block py-2 text-center text-[13px] font-semibold text-white" style={{ background: '#0078D4', borderRadius: 2 }}>
            Try Aurora free
          </Link>
        </div>
      )}
    </header>
  )
}

/* ── Hero ─────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)' }}>
      {/* Grid pattern like auth layout */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.00)_50%)]" />

      <div className="relative z-10 mx-auto max-w-[1080px] px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-[600px] text-center">
          <Link
            href="/example"
            className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-white/80 transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}
          >
            See what Aurora-generated content looks like →
            <ChevronRight className="h-3 w-3" />
          </Link>

          <h1 className="text-[36px] font-semibold leading-[1.12] text-white md:text-[48px]" style={{ letterSpacing: '-0.02em' }}>
            You tell us the topic.
            <br />
            We write the blog post.
          </h1>

          <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/65">
            Aurora turns a title into a full blog post — with FAQs, images, tables, and
            internal links. One click to enhance. Push to your CMS when ready.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-[#0078D4]"
              style={{ background: '#FFFFFF', borderRadius: 2 }}
            >
              Generate your first post free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-white/80"
              style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2 }}
            >
              See how it works
            </a>
          </div>

          <p className="mt-4 text-[11px] text-white/35">
            Free 14-day trial · No credit card · Takes 2 minutes to set up
          </p>
        </div>

        {/* Dashboard preview */}
        <div className="mt-14 overflow-hidden shadow-2xl" style={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-1.5 px-4 py-2" style={{ background: '#F5F5F5', borderBottom: '1px solid #E1E1E1' }}>
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#28C840' }} />
            <div className="ml-3 flex items-center gap-1.5">
              <AuroraLogo size={14} />
              <span className="text-[11px]" style={{ color: '#A0A0A0' }}>Aurora Dashboard</span>
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-3 p-3 space-y-0.5" style={{ background: '#1B1B1F' }}>
              {[
                { name: 'Blog Posts', active: true },
                { name: 'Titles', active: false },
                { name: 'Dictionary', active: false },
                { name: 'Analytics', active: false },
                { name: 'Settings', active: false },
              ].map((item) => (
                <div
                  key={item.name}
                  className="px-3 py-1.5 text-[11px]"
                  style={{
                    background: item.active ? '#0078D4' : 'transparent',
                    color: item.active ? '#FFFFFF' : '#A0A0A0',
                    fontWeight: item.active ? 600 : 400,
                    borderRadius: 2,
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
            <div className="col-span-9 p-5" style={{ background: '#F2F2F2' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>Blog Posts</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white" style={{ background: '#0078D4', borderRadius: 2 }}>
                  <Wand2 className="h-3 w-3" />
                  Generate Post
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { title: '10 Best Practices for Cloud Security in 2026', status: 'Published', sBg: '#DFF6DD', sC: '#107C10' },
                  { title: 'How to Implement Zero Trust Architecture', status: 'Autopilot', sBg: '#DEECF9', sC: '#0078D4' },
                  { title: 'The Complete Guide to API Rate Limiting', status: 'Draft', sBg: '#FFF4CE', sC: '#835C00' },
                  { title: 'Understanding Kubernetes Network Policies', status: 'Published', sBg: '#DFF6DD', sC: '#107C10' },
                ].map((post) => (
                  <div key={post.title} className="flex items-center gap-3 bg-white px-3 py-2.5" style={{ border: '1px solid #E1E1E1', borderRadius: 2 }}>
                    <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: '#C8C8C8' }} />
                    <span className="flex-1 text-[12px] truncate" style={{ color: '#323130' }}>{post.title}</span>
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold" style={{ background: post.sBg, color: post.sC, borderRadius: 2 }}>{post.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── How it works ─────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Connect your website',
      desc: 'Paste your URL. Aurora reads your site, figures out your industry, and knows what to write about.',
      icon: Globe,
    },
    {
      num: '02',
      title: 'Pick a title, hit generate',
      desc: 'Choose from suggested topics or type your own. You get a full post — intro, paragraphs, FAQ, images, conclusion. Not a draft. A post.',
      icon: Wand2,
    },
    {
      num: '03',
      title: 'Let Autopilot do the polishing',
      desc: 'Autopilot scans the post, rewrites weak sections, adds missing elements, generates images, and bumps your SEO score. Takes about 90 seconds.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'Push it live',
      desc: 'Send it to your CMS through our API, download it, or schedule it for later. Your content, your workflow.',
      icon: Plug,
    },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24" style={{ background: '#FFFFFF', borderBottom: '1px solid #E6E6E6' }}>
      <div className="mx-auto max-w-[1080px] px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#0078D4' }}>How it works</p>
        <h2 className="mt-2 text-[24px] font-semibold md:text-[30px]" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>
          Four steps. That&apos;s it.
        </h2>

        <div className="mt-12 grid gap-px md:grid-cols-4" style={{ background: '#E6E6E6' }}>
          {steps.map((s) => (
            <div key={s.num} className="p-6" style={{ background: '#FFFFFF' }}>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center" style={{ background: '#DEECF9', color: '#0078D4', borderRadius: 2 }}>
                <s.icon className="h-[18px] w-[18px]" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: '#0078D4' }}>{s.num}</p>
              <h3 className="text-[14px] font-semibold" style={{ color: '#1A1A1A' }}>{s.title}</h3>
              <p className="mt-1.5 text-[12px] leading-[1.6]" style={{ color: '#616161' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features ─────────────────────────────────────────────── */

const features = [
  { icon: FileText, title: 'Complete blog posts', text: 'Not outlines. Not drafts. Full posts with intros, paragraphs, FAQs, tables, images, code blocks, and conclusions.' },
  { icon: Wand2, title: 'Autopilot', text: 'Hit one button. Autopilot rewrites weak sections, adds missing elements, generates images, and raises your SEO score.' },
  { icon: BarChart3, title: 'Content scoring', text: 'Every post gets a quality score. See exactly what\'s weak — readability, keyword usage, missing internal links — and fix it.' },
  { icon: BookOpen, title: 'Dictionaries', text: 'Generate full glossaries for your industry. Each word gets a definition, examples, and related terms. Good for SEO, good for users.' },
  { icon: CalendarDays, title: 'Scheduling', text: 'Set a publish date. Aurora pushes it live when the time comes. Build a content calendar without a spreadsheet.' },
  { icon: Code2, title: 'Publishing API', text: 'POST to your CMS. Works with WordPress, headless setups, or anything with an endpoint. No copy-pasting.' },
  { icon: Globe, title: 'Multi-language', text: 'Write once, generate in other languages. Not machine translation — actual content generation in each language.' },
  { icon: Layers, title: 'Edit any element', text: 'Don\'t like a paragraph? Rewrite it. Want the FAQ longer? Regenerate just that section. You control every piece.' },
]

function Features() {
  return (
    <section id="features" className="py-16 md:py-24" style={{ background: '#F2F2F2' }}>
      <div className="mx-auto max-w-[1080px] px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#0078D4' }}>Features</p>
        <h2 className="mt-2 text-[24px] font-semibold md:text-[30px]" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>
          What you actually get.
        </h2>
        <p className="mt-2 max-w-md text-[14px]" style={{ color: '#616161' }}>
          Aurora doesn&apos;t spit out a Google Doc and call it a day. You get structured posts ready to go live.
        </p>

        <div className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: '#E1E1E1' }}>
          {features.map((f) => (
            <div key={f.title} className="p-5" style={{ background: '#FFFFFF' }}>
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center" style={{ background: '#F0F6FF', color: '#0078D4', borderRadius: 2 }}>
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>{f.title}</h3>
              <p className="mt-1 text-[12px] leading-[1.6]" style={{ color: '#616161' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Element types ────────────────────────────────────────── */

function ElementShowcase() {
  const elements = [
    'Paragraph', 'Introduction', 'Conclusion', 'FAQ', 'Table',
    'List', 'Numbered List', 'Quote', 'Code Block', 'Image',
    'Call to Action', 'Pros & Cons', 'Timeline', 'Checklist',
    'Statistics', 'Case Study', 'Product Recommendations',
  ]

  return (
    <section className="py-16 md:py-24" style={{ background: '#FFFFFF', borderTop: '1px solid #E6E6E6' }}>
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#0078D4' }}>Content types</p>
            <h2 className="mt-2 text-[24px] font-semibold md:text-[30px]" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>
              A blog post is more
              <br />
              than just text.
            </h2>
            <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: '#616161' }}>
              Aurora builds posts from 20+ element types. Each one is its own block — you
              can edit it, rewrite it, or swap it out without touching the rest.
            </p>
            <div className="mt-5">
              <Link href="/register" className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: '#0078D4' }}>
                Try it yourself <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {elements.map((el) => (
              <span
                key={el}
                className="px-3 py-1.5 text-[12px] font-medium cursor-default transition-colors"
                style={{ border: '1px solid #E1E1E1', color: '#323130', background: '#FFFFFF', borderRadius: 2 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0078D4'
                  e.currentTarget.style.background = '#F0F6FF'
                  e.currentTarget.style.color = '#0078D4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E1E1E1'
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.color = '#323130'
                }}
              >
                {el}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Before / After Autopilot ─────────────────────────────── */

function BeforeAfter() {
  return (
    <section className="py-16 md:py-24" style={{ background: '#F2F2F2', borderTop: '1px solid #E6E6E6' }}>
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#0078D4' }}>Autopilot</p>
          <h2 className="mt-2 text-[24px] font-semibold md:text-[30px]" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>
            Before and after Autopilot.
          </h2>
          <p className="mt-2 max-w-md text-[14px]" style={{ color: '#616161' }}>
            A generated post scores around 60. After Autopilot runs, it&apos;s usually above 90. Here&apos;s what changes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Before */}
          <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E1E1E1', borderRadius: 4 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full" style={{ background: '#FFB900' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#A0A0A0' }}>Before Autopilot</span>
            </div>
            <div className="space-y-2">
              {['Introduction', 'Paragraph', 'Conclusion'].map((type) => (
                <div key={type} className="p-3" style={{ background: '#F5F5F5', borderRadius: 2 }}>
                  <p className="text-[10px] font-semibold mb-1.5" style={{ color: '#A0A0A0' }}>{type}</p>
                  <div className="space-y-1">
                    <div className="h-2 w-full" style={{ background: '#E1E1E1', borderRadius: 1 }} />
                    <div className="h-2 w-4/5" style={{ background: '#E1E1E1', borderRadius: 1 }} />
                  </div>
                </div>
              ))}
              <p className="text-center pt-2 text-[11px]" style={{ color: '#A0A0A0' }}>3 elements · Score: 62</p>
            </div>
          </div>

          {/* After */}
          <div className="p-5" style={{ background: '#FFFFFF', border: '2px solid #0078D4', borderRadius: 4 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full" style={{ background: '#107C10' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#0078D4' }}>After Autopilot</span>
            </div>
            <div className="space-y-1.5">
              {[
                { type: 'Introduction', tag: 'Enhanced', tBg: '#DFF6DD', tC: '#107C10' },
                { type: 'Table of Contents', tag: 'New', tBg: '#DEECF9', tC: '#0078D4' },
                { type: 'Paragraph', tag: 'Enhanced', tBg: '#DFF6DD', tC: '#107C10' },
                { type: 'FAQ Section', tag: 'New', tBg: '#DEECF9', tC: '#0078D4' },
                { type: 'Image', tag: 'New', tBg: '#DEECF9', tC: '#0078D4' },
                { type: 'Statistics', tag: 'New', tBg: '#DEECF9', tC: '#0078D4' },
                { type: 'Paragraph', tag: 'Enhanced', tBg: '#DFF6DD', tC: '#107C10' },
                { type: 'Call to Action', tag: 'New', tBg: '#DEECF9', tC: '#0078D4' },
                { type: 'Conclusion', tag: 'Enhanced', tBg: '#DFF6DD', tC: '#107C10' },
              ].map((el, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2" style={{ background: '#FAFAFA', borderRadius: 2 }}>
                  <span className="flex-1 text-[12px]" style={{ color: '#323130' }}>{el.type}</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold" style={{ background: el.tBg, color: el.tC, borderRadius: 2 }}>{el.tag}</span>
                </div>
              ))}
              <p className="text-center pt-2 text-[11px] font-semibold" style={{ color: '#0078D4' }}>9 elements · Score: 94</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA ──────────────────────────────────────────────────── */

function CTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)' }}>
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 mx-auto max-w-[1080px] px-6 text-center">
        <AuroraLogo size={40} light />
        <h2 className="mt-5 text-[24px] font-semibold text-white md:text-[32px]" style={{ letterSpacing: '-0.01em' }}>
          Your first post takes 5 minutes.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-white/60">
          Sign up, paste your URL, pick a topic, and generate. That&apos;s it. Free for 14 days.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold"
            style={{ background: '#FFFFFF', color: '#0078D4', borderRadius: 2 }}
          >
            Generate your first post <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/example"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-white/80"
            style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2 }}
          >
            See a live example
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="py-10" style={{ background: '#FFFFFF', borderTop: '1px solid #E6E6E6' }}>
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/landing" className="flex items-center gap-2">
              <AuroraLogo size={20} />
              <span className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>Aurora</span>
            </Link>
            <p className="mt-3 text-[11px] leading-[1.6]" style={{ color: '#A0A0A0' }}>
              AI-powered content generation
              by Nordtools.
            </p>
          </div>

          {[
            { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Example site', href: '/example' }, { label: 'API docs', href: '#' }] },
            { title: 'Company', links: [{ label: 'About Nordtools', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Contact', href: '#' }] },
            { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Cookies', href: '#' }] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#A0A0A0' }}>{col.title}</p>
              <ul className="space-y-1.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[12px]" style={{ color: '#616161' }}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-5 text-[11px]" style={{ borderTop: '1px solid #E6E6E6', color: '#A0A0A0' }}>
          © {new Date().getFullYear()} Nordtools. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen antialiased" style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif" }}>
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <ElementShowcase />
      <BeforeAfter />
      <CTA />
      <Footer />
    </div>
  )
}
