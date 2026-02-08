import { Metadata } from 'next'
import { StaticPageLayout } from '../_components/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — Aurora by Nordtools',
  description: 'How Aurora by Nordtools collects, uses, and protects your personal data.',
}

const prose = {
  h1: 'text-[28px] font-semibold leading-tight md:text-[34px]',
  h2: 'text-[18px] font-semibold mt-10 mb-3 md:text-[20px]',
  p: 'text-[14px] leading-[1.75] mb-4',
  ul: 'text-[14px] leading-[1.75] mb-4 pl-5 list-disc space-y-1',
  muted: { color: '#616161' },
  heading: { color: '#1A1A1A', letterSpacing: '-0.01em' },
}

export default function PrivacyPage() {
  return (
    <StaticPageLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#0078D4' }}>Legal</p>
      <h1 className={prose.h1} style={prose.heading}>Privacy Policy</h1>
      <p className="text-[13px] mt-2 mb-8" style={{ color: '#A0A0A0' }}>Last updated: February 2026</p>

      <p className={prose.p} style={prose.muted}>
        This Privacy Policy describes how Nordtools AB (&quot;Nordtools&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects,
        uses, and protects your personal data when you use Aurora, our AI-powered content generation platform,
        and related services (collectively, the &quot;Service&quot;). By using the Service, you agree to the practices described in this policy.
      </p>

      <h2 className={prose.h2} style={prose.heading}>1. Data We Collect</h2>
      <p className={prose.p} style={prose.muted}>We collect the following categories of data:</p>
      <ul className={prose.ul} style={prose.muted}>
        <li><strong>Account information</strong> — your name, email address, and password when you create an account.</li>
        <li><strong>Website URLs</strong> — the website addresses you connect to Aurora so we can analyze your industry and generate relevant content.</li>
        <li><strong>Generated content</strong> — blog posts, dictionary entries, and other content created through the Service.</li>
        <li><strong>Usage analytics</strong> — information about how you interact with the Service, including pages visited, features used, and session duration.</li>
        <li><strong>Payment information</strong> — billing details processed through our third-party payment provider. We do not store full credit card numbers.</li>
        <li><strong>Device and browser data</strong> — IP address, browser type, operating system, and device identifiers collected automatically.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>2. How We Use Your Data</h2>
      <ul className={prose.ul} style={prose.muted}>
        <li><strong>Provide the Service</strong> — to generate content, manage your account, and deliver the features you use.</li>
        <li><strong>Improve our AI models</strong> — to enhance content quality and relevance. We may use aggregated, anonymized usage patterns to train and improve our models. Your individual content is not shared with other users.</li>
        <li><strong>Analytics and performance</strong> — to understand usage patterns, diagnose issues, and improve the user experience.</li>
        <li><strong>Communication</strong> — to send service-related emails such as account confirmations, billing receipts, and important updates.</li>
        <li><strong>Security</strong> — to detect and prevent fraud, abuse, and security incidents.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>3. Cookies</h2>
      <p className={prose.p} style={prose.muted}>
        We use cookies and similar technologies to keep you logged in, remember your preferences, and understand
        how you use the Service. For full details, see our{' '}
        <a href="/landing/cookies" className="font-medium" style={{ color: '#0078D4' }}>Cookie Policy</a>.
      </p>
      <ul className={prose.ul} style={prose.muted}>
        <li><strong>Essential cookies</strong> — required for authentication and security (session tokens, CSRF protection).</li>
        <li><strong>Functional cookies</strong> — remember your preferences such as selected company and theme.</li>
        <li><strong>Analytics cookies</strong> — help us understand usage patterns to improve the Service.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>4. Third-Party Services</h2>
      <p className={prose.p} style={prose.muted}>We share data with the following categories of third-party providers:</p>
      <ul className={prose.ul} style={prose.muted}>
        <li><strong>AI providers</strong> — we use third-party AI models to generate content. Your website URL and topic information are sent to these providers to produce content. We have data processing agreements in place with all AI providers.</li>
        <li><strong>Payment processors</strong> — subscription payments are handled by our payment provider. Your billing information is processed directly by them under their own privacy policy.</li>
        <li><strong>Infrastructure providers</strong> — hosting, CDN, and email delivery services that help us operate the Service reliably.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>5. Data Retention and Deletion</h2>
      <p className={prose.p} style={prose.muted}>
        We retain your personal data for as long as your account is active or as needed to provide the Service.
        Generated content is stored until you delete it or close your account. When you delete your account,
        we remove your personal data within 30 days, except where retention is required by law (e.g., billing records).
      </p>

      <h2 className={prose.h2} style={prose.heading}>6. Your Rights</h2>
      <p className={prose.p} style={prose.muted}>Under applicable data protection laws, including the GDPR, you have the right to:</p>
      <ul className={prose.ul} style={prose.muted}>
        <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
        <li><strong>Correction</strong> — request that we correct inaccurate or incomplete data.</li>
        <li><strong>Deletion</strong> — request that we delete your personal data.</li>
        <li><strong>Export</strong> — receive your data in a structured, machine-readable format.</li>
        <li><strong>Restriction</strong> — request that we limit the processing of your data in certain circumstances.</li>
        <li><strong>Objection</strong> — object to our processing of your data for certain purposes.</li>
      </ul>
      <p className={prose.p} style={prose.muted}>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:privacy@nordtools.com" className="font-medium" style={{ color: '#0078D4' }}>privacy@nordtools.com</a>.
        We will respond within 30 days.
      </p>

      <h2 className={prose.h2} style={prose.heading}>7. GDPR Compliance</h2>
      <p className={prose.p} style={prose.muted}>
        Nordtools AB is based in Sweden and processes data in accordance with the General Data Protection
        Regulation (GDPR). Our lawful bases for processing include: performance of a contract (providing the Service),
        legitimate interests (improving and securing the Service), and consent (for analytics cookies and marketing
        communications). You may withdraw your consent at any time.
      </p>

      <h2 className={prose.h2} style={prose.heading}>8. Data Security</h2>
      <p className={prose.p} style={prose.muted}>
        We implement appropriate technical and organizational measures to protect your data, including encryption
        in transit and at rest, access controls, and regular security assessments. However, no method of
        transmission over the internet is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2 className={prose.h2} style={prose.heading}>9. Changes to This Policy</h2>
      <p className={prose.p} style={prose.muted}>
        We may update this Privacy Policy from time to time. We will notify you of significant changes by email
        or through the Service. Your continued use after changes take effect constitutes acceptance of the updated policy.
      </p>

      <h2 className={prose.h2} style={prose.heading}>10. Contact</h2>
      <p className={prose.p} style={prose.muted}>
        If you have questions about this Privacy Policy or our data practices, contact us at:
      </p>
      <p className={prose.p} style={prose.muted}>
        Nordtools AB<br />
        Stockholm, Sweden<br />
        <a href="mailto:privacy@nordtools.com" className="font-medium" style={{ color: '#0078D4' }}>privacy@nordtools.com</a>
      </p>
    </StaticPageLayout>
  )
}
