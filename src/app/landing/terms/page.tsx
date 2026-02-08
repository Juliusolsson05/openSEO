import { Metadata } from 'next'
import { StaticPageLayout } from '../_components/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Terms of Service — Aurora by Nordtools',
  description: 'Terms and conditions for using Aurora, the AI-powered content generation platform by Nordtools.',
}

const prose = {
  h1: 'text-[28px] font-semibold leading-tight md:text-[34px]',
  h2: 'text-[18px] font-semibold mt-10 mb-3 md:text-[20px]',
  p: 'text-[14px] leading-[1.75] mb-4',
  ul: 'text-[14px] leading-[1.75] mb-4 pl-5 list-disc space-y-1',
  muted: { color: '#616161' },
  heading: { color: '#1A1A1A', letterSpacing: '-0.01em' },
}

export default function TermsPage() {
  return (
    <StaticPageLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#0078D4' }}>Legal</p>
      <h1 className={prose.h1} style={prose.heading}>Terms of Service</h1>
      <p className="text-[13px] mt-2 mb-8" style={{ color: '#A0A0A0' }}>Last updated: February 2026</p>

      <p className={prose.p} style={prose.muted}>
        These Terms of Service (&quot;Terms&quot;) govern your use of Aurora, an AI-powered content generation platform
        operated by Nordtools AB (&quot;Nordtools&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By creating an account or using the
        Service, you agree to be bound by these Terms.
      </p>

      <h2 className={prose.h2} style={prose.heading}>1. Acceptance of Terms</h2>
      <p className={prose.p} style={prose.muted}>
        By accessing or using Aurora, you confirm that you are at least 18 years old and have the legal capacity
        to enter into these Terms. If you are using the Service on behalf of an organization, you represent that
        you have the authority to bind that organization to these Terms.
      </p>

      <h2 className={prose.h2} style={prose.heading}>2. Account Responsibilities</h2>
      <ul className={prose.ul} style={prose.muted}>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>You must provide accurate and complete information when creating your account.</li>
        <li>You agree to notify us immediately of any unauthorized use of your account.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>3. Service Description</h2>
      <p className={prose.p} style={prose.muted}>
        Aurora is an AI-powered content generation platform that creates blog posts, dictionary entries, and other
        written content based on your inputs. The Service uses artificial intelligence models to generate content.
      </p>
      <p className={prose.p} style={prose.muted}>
        <strong>Content accuracy is not guaranteed.</strong> AI-generated content may contain inaccuracies, outdated
        information, or errors. You are solely responsible for reviewing, editing, and fact-checking all generated
        content before publication. Nordtools does not guarantee that generated content is accurate, complete,
        original, or suitable for any particular purpose.
      </p>

      <h2 className={prose.h2} style={prose.heading}>4. Subscription and Billing</h2>
      <ul className={prose.ul} style={prose.muted}>
        <li>Aurora offers both free trials and paid subscription plans.</li>
        <li>Paid subscriptions are billed on a recurring basis (monthly or annually) as selected at the time of purchase.</li>
        <li>You authorize us to charge your payment method on each billing cycle.</li>
        <li>Prices may change with 30 days&apos; notice. Existing subscriptions will be honored until the end of the current billing period.</li>
        <li>Refunds are handled on a case-by-case basis. Contact us within 14 days of a charge to request a review.</li>
        <li>You may cancel your subscription at any time. Access continues until the end of the current billing period.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>5. Intellectual Property</h2>
      <p className={prose.p} style={prose.muted}>
        <strong>Your content:</strong> You retain full ownership of all content generated through Aurora using your
        account. You grant Nordtools a limited license to store and process your content solely to provide the Service.
      </p>
      <p className={prose.p} style={prose.muted}>
        <strong>Our platform:</strong> Aurora&apos;s software, design, branding, and documentation are owned by
        Nordtools and protected by intellectual property laws. These Terms do not grant you any rights to our
        intellectual property beyond the right to use the Service as described here.
      </p>

      <h2 className={prose.h2} style={prose.heading}>6. Acceptable Use</h2>
      <p className={prose.p} style={prose.muted}>You agree not to use Aurora to:</p>
      <ul className={prose.ul} style={prose.muted}>
        <li>Generate content that is illegal, harmful, defamatory, obscene, or infringes on the rights of others.</li>
        <li>Misrepresent AI-generated content as human-written in contexts where such disclosure is legally required.</li>
        <li>Attempt to reverse-engineer, decompile, or extract the underlying AI models or algorithms.</li>
        <li>Use automated tools to scrape, overload, or abuse the Service.</li>
        <li>Resell or redistribute the Service without our written permission.</li>
        <li>Violate any applicable laws or regulations.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>7. Limitation of Liability</h2>
      <p className={prose.p} style={prose.muted}>
        To the maximum extent permitted by law, Nordtools shall not be liable for any indirect, incidental,
        special, consequential, or punitive damages, including but not limited to loss of profits, data, or
        business opportunities, arising from your use of the Service.
      </p>
      <p className={prose.p} style={prose.muted}>
        Our total liability for any claims under these Terms shall not exceed the amount you paid us in the
        twelve (12) months preceding the claim. The Service is provided &quot;as is&quot; and &quot;as available&quot; without
        warranties of any kind, express or implied.
      </p>

      <h2 className={prose.h2} style={prose.heading}>8. Termination</h2>
      <p className={prose.p} style={prose.muted}>
        You may close your account at any time through the account settings or by contacting us. We may suspend
        or terminate your account if you violate these Terms, with or without notice. Upon termination, your
        right to use the Service ceases immediately. We will retain your data in accordance with our{' '}
        <a href="/landing/privacy" className="font-medium" style={{ color: '#0078D4' }}>Privacy Policy</a>.
      </p>

      <h2 className={prose.h2} style={prose.heading}>9. Changes to These Terms</h2>
      <p className={prose.p} style={prose.muted}>
        We may modify these Terms at any time. We will notify you of material changes via email or through
        the Service at least 30 days before they take effect. Your continued use of the Service after changes
        take effect constitutes acceptance.
      </p>

      <h2 className={prose.h2} style={prose.heading}>10. Governing Law</h2>
      <p className={prose.p} style={prose.muted}>
        These Terms are governed by the laws of Sweden. Any disputes arising under these Terms shall be
        resolved in the courts of Stockholm, Sweden. Nothing in these Terms limits your rights under
        mandatory consumer protection laws in your jurisdiction.
      </p>

      <h2 className={prose.h2} style={prose.heading}>11. Contact</h2>
      <p className={prose.p} style={prose.muted}>
        For questions about these Terms, contact us at:
      </p>
      <p className={prose.p} style={prose.muted}>
        Nordtools AB<br />
        Stockholm, Sweden<br />
        <a href="mailto:legal@nordtools.com" className="font-medium" style={{ color: '#0078D4' }}>legal@nordtools.com</a>
      </p>
    </StaticPageLayout>
  )
}
