import { Metadata } from 'next'
import { StaticPageLayout } from '../_components/StaticPageLayout'

export const metadata: Metadata = {
  title: 'Cookie Policy — Aurora by Nordtools',
  description: 'How Aurora by Nordtools uses cookies and similar technologies.',
}

const prose = {
  h1: 'text-[28px] font-semibold leading-tight md:text-[34px]',
  h2: 'text-[18px] font-semibold mt-10 mb-3 md:text-[20px]',
  h3: 'text-[15px] font-semibold mt-6 mb-2',
  p: 'text-[14px] leading-[1.75] mb-4',
  ul: 'text-[14px] leading-[1.75] mb-4 pl-5 list-disc space-y-1',
  muted: { color: '#616161' },
  heading: { color: '#1A1A1A', letterSpacing: '-0.01em' },
}

export default function CookiePolicyPage() {
  return (
    <StaticPageLayout>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#0078D4' }}>Legal</p>
      <h1 className={prose.h1} style={prose.heading}>Cookie Policy</h1>
      <p className="text-[13px] mt-2 mb-8" style={{ color: '#A0A0A0' }}>Last updated: February 2026</p>

      <h2 className={prose.h2} style={prose.heading}>What Are Cookies?</h2>
      <p className={prose.p} style={prose.muted}>
        Cookies are small text files stored on your device when you visit a website. They help the site remember
        your preferences, keep you logged in, and understand how you use the service. Some cookies are essential
        for the site to function; others help us improve your experience.
      </p>

      <h2 className={prose.h2} style={prose.heading}>Cookies We Use</h2>

      <h3 className={prose.h3} style={prose.heading}>Essential Cookies</h3>
      <p className={prose.p} style={prose.muted}>
        These cookies are required for Aurora to function. They cannot be disabled.
      </p>
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-[13px]" style={{ color: '#616161' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E1E1E1' }}>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: '#1A1A1A' }}>Cookie</th>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: '#1A1A1A' }}>Purpose</th>
              <th className="text-left py-2 font-semibold" style={{ color: '#1A1A1A' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">session_token</td>
              <td className="py-2 pr-4">Keeps you logged in</td>
              <td className="py-2">Session</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">auth_refresh</td>
              <td className="py-2 pr-4">Refreshes your authentication</td>
              <td className="py-2">30 days</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">csrf_token</td>
              <td className="py-2 pr-4">Protects against cross-site request forgery</td>
              <td className="py-2">Session</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={prose.h3} style={prose.heading}>Functional Cookies</h3>
      <p className={prose.p} style={prose.muted}>
        These cookies remember your preferences to provide a better experience.
      </p>
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-[13px]" style={{ color: '#616161' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E1E1E1' }}>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: '#1A1A1A' }}>Cookie</th>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: '#1A1A1A' }}>Purpose</th>
              <th className="text-left py-2 font-semibold" style={{ color: '#1A1A1A' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">companyId</td>
              <td className="py-2 pr-4">Remembers your selected company/workspace</td>
              <td className="py-2">1 year</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">theme</td>
              <td className="py-2 pr-4">Stores your preferred theme (light/dark)</td>
              <td className="py-2">1 year</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">locale</td>
              <td className="py-2 pr-4">Remembers your language preference</td>
              <td className="py-2">1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={prose.h3} style={prose.heading}>Analytics Cookies</h3>
      <p className={prose.p} style={prose.muted}>
        These cookies help us understand how you use Aurora so we can improve the Service.
      </p>
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-[13px]" style={{ color: '#616161' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E1E1E1' }}>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: '#1A1A1A' }}>Cookie</th>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: '#1A1A1A' }}>Purpose</th>
              <th className="text-left py-2 font-semibold" style={{ color: '#1A1A1A' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">_analytics_id</td>
              <td className="py-2 pr-4">Unique visitor identifier for usage analytics</td>
              <td className="py-2">1 year</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E1E1E1' }}>
              <td className="py-2 pr-4 font-mono text-[12px]">_analytics_session</td>
              <td className="py-2 pr-4">Tracks a single browsing session</td>
              <td className="py-2">30 minutes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={prose.h2} style={prose.heading}>Managing Cookies</h2>
      <p className={prose.p} style={prose.muted}>
        You can control and manage cookies in several ways:
      </p>
      <ul className={prose.ul} style={prose.muted}>
        <li><strong>Browser settings</strong> — most browsers allow you to view, manage, and delete cookies through their settings. Note that disabling essential cookies may prevent Aurora from functioning properly.</li>
        <li><strong>Our cookie banner</strong> — when you first visit Aurora, you can accept or manage your cookie preferences through our consent banner.</li>
        <li><strong>Opt out of analytics</strong> — you can disable analytics cookies through your browser settings or by using a &quot;Do Not Track&quot; signal, which we respect.</li>
      </ul>

      <h2 className={prose.h2} style={prose.heading}>Changes to This Policy</h2>
      <p className={prose.p} style={prose.muted}>
        We may update this Cookie Policy when we change our cookie practices. We will update the &quot;Last updated&quot;
        date at the top of this page. Significant changes will be communicated through the Service.
      </p>

      <h2 className={prose.h2} style={prose.heading}>Contact</h2>
      <p className={prose.p} style={prose.muted}>
        If you have questions about our use of cookies, contact us at{' '}
        <a href="mailto:privacy@nordtools.com" className="font-medium" style={{ color: '#0078D4' }}>privacy@nordtools.com</a>.
      </p>
    </StaticPageLayout>
  )
}
