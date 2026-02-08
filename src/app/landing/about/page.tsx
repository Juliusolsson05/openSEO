import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { StaticPageLayout } from '../_components/StaticPageLayout'

export const metadata: Metadata = {
  title: 'About Nordtools — Aurora',
  description: 'Learn about Nordtools, the team behind Aurora — helping businesses scale content creation with AI.',
}

const heading = { color: '#1A1A1A', letterSpacing: '-0.01em' }
const muted = { color: '#616161' }

export default function AboutPage() {
  return (
    <StaticPageLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#0078D4' }}>Company</p>
      <h1 className="text-[28px] font-semibold leading-tight md:text-[34px]" style={heading}>
        About Nordtools
      </h1>
      <p className="text-[15px] leading-[1.7] mt-4 mb-10" style={muted}>
        We&apos;re building tools that help businesses publish better content, faster. Aurora is our flagship product —
        an AI-powered platform that turns a topic into a complete, publish-ready blog post.
      </p>

      {/* Mission */}
      <section className="mb-10">
        <h2 className="text-[18px] font-semibold mb-3 md:text-[20px]" style={heading}>Our Mission</h2>
        <p className="text-[14px] leading-[1.75]" style={muted}>
          Content marketing works — but it&apos;s slow, expensive, and hard to scale. Most businesses know they need
          to publish regularly, but they don&apos;t have the time or resources to keep up. We&apos;re changing that.
          Nordtools exists to give every team the ability to produce high-quality content at scale, without
          sacrificing what makes content good.
        </p>
      </section>

      {/* Who we are */}
      <section className="mb-10">
        <h2 className="text-[18px] font-semibold mb-3 md:text-[20px]" style={heading}>Who We Are</h2>
        <p className="text-[14px] leading-[1.75]" style={muted}>
          Nordtools is a small, focused team based in Stockholm, Sweden. We&apos;re developers, designers, and content
          people who got frustrated with the state of AI content tools — they were either too generic, too
          complicated, or produced content nobody wanted to read. So we built something better.
        </p>
      </section>

      {/* Values */}
      <section className="mb-10">
        <h2 className="text-[18px] font-semibold mb-3 md:text-[20px]" style={heading}>What We Believe</h2>
        <div className="space-y-4 mt-4">
          {[
            {
              title: 'Quality over quantity',
              text: 'One great post beats ten mediocre ones. Aurora is designed to produce content you\'d actually want to read — not just filler for search engines.',
            },
            {
              title: 'Transparency',
              text: 'We\'re upfront about what Aurora can and can\'t do. AI-generated content needs human review. We\'ll never pretend otherwise.',
            },
            {
              title: 'User-first',
              text: 'We build features that solve real problems, not features that look good on a pricing page. If something doesn\'t help you publish better content, we skip it.',
            },
          ].map((value) => (
            <div key={value.title} className="p-4" style={{ background: '#F8F8F8', borderRadius: 4 }}>
              <h3 className="text-[14px] font-semibold mb-1" style={{ color: '#1A1A1A' }}>{value.title}</h3>
              <p className="text-[13px] leading-[1.65]" style={muted}>{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pt-6" style={{ borderTop: '1px solid #E6E6E6' }}>
        <p className="text-[14px] leading-[1.75] mb-4" style={muted}>
          Want to see what Aurora can do? Try it free for 14 days.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white"
          style={{ background: '#0078D4', borderRadius: 2 }}
        >
          Get started <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </StaticPageLayout>
  )
}
