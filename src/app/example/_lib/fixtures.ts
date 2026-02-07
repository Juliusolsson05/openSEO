import type { ExampleDictionary, ExamplePost } from './types'

export const EXAMPLE_POSTS: ExamplePost[] = [
  {
    id: 'post-1',
    slug: 'how-to-reduce-api-latency',
    title: 'How to Reduce API Latency Without Rewriting Your Stack',
    excerpt:
      'Practical steps to cut API response times using caching, smarter payloads, and better observability.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=API+Latency',
    published_at: '2026-01-14',
    elements: [
      {
        id: 'p1-e1',
        order: 1,
        element_type: 'introduction',
        content: {
          title: 'Latency is a product problem, not only an infrastructure problem',
          text: 'When response times cross 300ms, users start to notice friction. The fastest wins usually come from reducing unnecessary work—not adding more servers.',
        },
      },
      {
        id: 'p1-e2',
        order: 2,
        element_type: 'paragraph',
        content: {
          title: 'Start with your p95 and p99',
          text: 'Averages hide pain. Track <strong>p95</strong> and <strong>p99</strong> latency per endpoint to reveal tail performance. Then split by region, customer tier, and request size to find your true bottleneck.',
        },
      },
      {
        id: 'p1-e3',
        order: 3,
        element_type: 'list_paragraph',
        content: {
          title: 'Three high-impact optimizations',
          items: [
            'Use a read-through cache for expensive GET endpoints.',
            'Compress JSON responses and remove unused fields.',
            'Parallelize independent upstream calls with timeouts.',
          ],
        },
      },
      {
        id: 'p1-e4',
        order: 4,
        element_type: 'image',
        content: {
          alt: 'Latency waterfall',
          caption: 'A typical request waterfall showing database and third-party API delays.',
        },
      },
      {
        id: 'p1-e5',
        order: 5,
        element_type: 'table',
        content: {
          title: 'Example latency budget',
          headers: ['Layer', 'Target', 'Current'],
          rows: [
            ['Edge + TLS', '20ms', '22ms'],
            ['App processing', '60ms', '95ms'],
            ['Database', '80ms', '140ms'],
            ['Third-party APIs', '40ms', '120ms'],
          ],
        },
      },
      {
        id: 'p1-e6',
        order: 6,
        element_type: 'quote',
        content: {
          text: 'Most latency incidents are architecture drift, not sudden traffic spikes.',
          attribution: 'Elina Berg, Staff Engineer at Awesome SaaS',
        },
      },
      {
        id: 'p1-e7',
        order: 7,
        element_type: 'code_cluster',
        content: {
          title: 'Set a strict timeout on upstream calls',
          language: 'ts',
          code: "const response = await fetch(url, { signal: AbortSignal.timeout(180) })\nif (!response.ok) throw new Error('Upstream failed')",
        },
      },
      {
        id: 'p1-e8',
        order: 8,
        element_type: 'faq',
        content: {
          title: 'FAQ',
          items: [
            {
              question: 'Should we optimize database or API gateway first?',
              answer:
                'Start where the latency histogram is widest. In many SaaS systems, database query variance creates more user-visible delay than gateway overhead.',
            },
            {
              question: 'How often should we review latency budgets?',
              answer: 'At minimum once per quarter and after every major product launch.',
            },
          ],
        },
      },
      {
        id: 'p1-e9',
        order: 9,
        element_type: 'call_to_action',
        content: {
          title: 'Run a free latency audit',
          text: 'Get an endpoint-by-endpoint breakdown with quick-win recommendations in under 48 hours.',
          button_label: 'Book an audit',
          button_href: '/example',
        },
      },
      {
        id: 'p1-e10',
        order: 10,
        element_type: 'conclusion',
        content: {
          title: 'Conclusion',
          text: 'Latency falls fastest when teams define budgets, measure tails, and enforce guardrails in CI. Small fixes compound quickly.',
        },
      },
    ],
  },
  {
    id: 'post-2',
    slug: 'building-a-multi-region-architecture',
    title: 'Building a Multi-Region Architecture That Actually Fails Over',
    excerpt:
      'A practical blueprint for global deployments with clear ownership, data strategy, and failover drills.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Multi-Region+Architecture',
    published_at: '2025-12-19',
    elements: [
      {
        id: 'p2-e1',
        order: 1,
        element_type: 'introduction',
        content: {
          title: 'Multi-region is an operations discipline',
          text: 'Deploying in two regions is easy. Recovering traffic during a real incident is hard. Design for human response as much as system response.',
        },
      },
      {
        id: 'p2-e2',
        order: 2,
        element_type: 'paragraph',
        content: {
          title: 'Choose your data ownership model early',
          text: 'Most outages during failover come from unclear write authority. Define primary ownership, replication lag tolerances, and conflict handling before launch.',
        },
      },
      {
        id: 'p2-e3',
        order: 3,
        element_type: 'list_paragraph',
        content: {
          title: 'Failover readiness checklist',
          items: [
            'Automated health checks with region-level routing decisions.',
            'Runbooks that include communication templates and ownership.',
            'Quarterly game days with full traffic shift simulations.',
          ],
        },
      },
      {
        id: 'p2-e4',
        order: 4,
        element_type: 'table',
        content: {
          title: 'Recommended RTO/RPO targets',
          headers: ['Service tier', 'RTO', 'RPO'],
          rows: [
            ['Critical APIs', '< 5 min', '< 1 min'],
            ['Core dashboard', '< 15 min', '< 5 min'],
            ['Analytics pipelines', '< 60 min', '< 15 min'],
          ],
        },
      },
      {
        id: 'p2-e5',
        order: 5,
        element_type: 'quote',
        content: {
          text: 'If you have not rehearsed failover under business hours, you do not have failover.',
          attribution: 'Mikael Sandström, SRE Lead',
        },
      },
      {
        id: 'p2-e6',
        order: 6,
        element_type: 'image',
        content: {
          alt: 'Regional traffic map',
          caption: 'Traffic routing between EU-West and US-East regions during normal and failover mode.',
        },
      },
      {
        id: 'p2-e7',
        order: 7,
        element_type: 'faq',
        content: {
          title: 'FAQ',
          items: [
            {
              question: 'Active-active or active-passive?',
              answer:
                'Start active-passive if your team is small. Move to active-active after you have strong observability and mature deployment controls.',
            },
          ],
        },
      },
      {
        id: 'p2-e8',
        order: 8,
        element_type: 'conclusion',
        content: {
          title: 'Conclusion',
          text: 'Multi-region architecture succeeds when platform, product, and incident response all work as one system.',
        },
      },
    ],
  },
  {
    id: 'post-3',
    slug: 'complete-guide-to-rate-limiting',
    title: 'The Complete Guide to Rate Limiting for SaaS APIs',
    excerpt:
      'How to protect your platform without frustrating legitimate users, with clear policies and transparent errors.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Rate+Limiting',
    published_at: '2025-11-08',
    elements: [
      {
        id: 'p3-e1',
        order: 1,
        element_type: 'introduction',
        content: {
          title: 'Rate limits are a fairness mechanism',
          text: 'Good limits protect shared infrastructure while preserving a predictable experience for healthy traffic.',
        },
      },
      {
        id: 'p3-e2',
        order: 2,
        element_type: 'paragraph',
        content: {
          title: 'Pick a strategy per endpoint class',
          text: 'Login and auth endpoints need stricter burst control than read-heavy analytics endpoints. Token bucket handles bursts well, while leaky bucket smooths traffic.',
        },
      },
      {
        id: 'p3-e3',
        order: 3,
        element_type: 'code_cluster',
        content: {
          title: 'Expose predictable headers',
          language: 'http',
          code: 'X-RateLimit-Limit: 120\nX-RateLimit-Remaining: 19\nX-RateLimit-Reset: 1736181900',
        },
      },
      {
        id: 'p3-e4',
        order: 4,
        element_type: 'list_paragraph',
        content: {
          title: 'What every limit response should include',
          items: [
            'A machine-readable error code.',
            'Exact reset time in epoch format.',
            'A link to documentation and upgrade paths.',
          ],
        },
      },
      {
        id: 'p3-e5',
        order: 5,
        element_type: 'table',
        content: {
          title: 'Sample plan limits',
          headers: ['Plan', 'Requests/min', 'Burst'],
          rows: [
            ['Free', '60', '20'],
            ['Pro', '600', '120'],
            ['Enterprise', 'Custom', 'Custom'],
          ],
        },
      },
      {
        id: 'p3-e6',
        order: 6,
        element_type: 'faq',
        content: {
          title: 'FAQ',
          items: [
            {
              question: 'Should limits be global or per endpoint?',
              answer: 'Use both. Global protects overall health, endpoint limits protect sensitive operations.',
            },
            {
              question: 'Can we whitelist enterprise customers?',
              answer:
                'Yes, but track those exceptions and alert on unusual burst behavior to avoid hidden risk.',
            },
          ],
        },
      },
      {
        id: 'p3-e7',
        order: 7,
        element_type: 'quote',
        content: {
          text: 'The best rate limit is one users can predict before they hit it.',
          attribution: 'Amina Hassan, Product Manager',
        },
      },
      {
        id: 'p3-e8',
        order: 8,
        element_type: 'call_to_action',
        content: {
          title: 'Need help defining plan limits?',
          text: 'Our team can benchmark your traffic and suggest safe limits per customer segment.',
          button_label: 'Talk to solutions',
          button_href: '/example',
        },
      },
      {
        id: 'p3-e9',
        order: 9,
        element_type: 'conclusion',
        content: {
          title: 'Conclusion',
          text: 'Rate limiting works best when policies are transparent, differentiated by use case, and reviewed with real traffic data.',
        },
      },
    ],
  },
  {
    id: 'post-4',
    slug: 'observability-for-growing-saas-teams',
    title: 'Observability for Growing SaaS Teams: Logs, Metrics, and Traces',
    excerpt:
      'A practical framework to move from noisy dashboards to actionable insight across engineering and product.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Observability',
    published_at: '2025-10-03',
    elements: [
      {
        id: 'p4-e1',
        order: 1,
        element_type: 'introduction',
        content: {
          title: 'Observability should answer business questions',
          text: 'The goal is not more charts. The goal is faster diagnosis when customer outcomes degrade.',
        },
      },
      {
        id: 'p4-e2',
        order: 2,
        element_type: 'paragraph',
        content: {
          title: 'Define golden signals per product journey',
          text: 'Map sign-up, billing, and core usage flows to latency, error rate, and saturation. This creates a shared language between engineering and support.',
        },
      },
      {
        id: 'p4-e3',
        order: 3,
        element_type: 'image',
        content: {
          alt: 'Observability dashboard mock',
          caption: 'A dashboard that links service health to user funnel conversion.',
        },
      },
      {
        id: 'p4-e4',
        order: 4,
        element_type: 'code_cluster',
        content: {
          title: 'Attach request context to every log line',
          language: 'json',
          code: '{"request_id":"req_8f1","customer_id":"cus_91","endpoint":"/v1/events","latency_ms":42}',
        },
      },
      {
        id: 'p4-e5',
        order: 5,
        element_type: 'list_paragraph',
        content: {
          title: 'What to add in your first month',
          items: [
            'SLOs for top 5 customer-critical endpoints.',
            'Error budget alerts routed to on-call and product owner.',
            'Trace sampling policy for high-value flows.',
          ],
        },
      },
      {
        id: 'p4-e6',
        order: 6,
        element_type: 'faq',
        content: {
          title: 'FAQ',
          items: [
            {
              question: 'How much should we sample traces?',
              answer: 'Start at 10% globally and 100% for critical or failing paths.',
            },
          ],
        },
      },
      {
        id: 'p4-e7',
        order: 7,
        element_type: 'conclusion',
        content: {
          title: 'Conclusion',
          text: 'A focused observability stack reduces incident duration, improves roadmap decisions, and builds trust with customers.',
        },
      },
    ],
  },
  {
    id: 'post-5',
    slug: 'database-indexing-mistakes',
    title: 'Five Database Indexing Mistakes That Kill Query Performance',
    excerpt: 'The most common indexing errors we see in production PostgreSQL and how to spot them before users complain.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Database+Indexing',
    published_at: '2025-11-20',
    elements: [
      { id: 'p5-e1', order: 1, element_type: 'introduction', content: { title: 'Indexes are cheap to add, expensive to get wrong', text: 'A missing index is obvious — the query is slow. But the wrong index wastes disk, slows writes, and gives you a false sense of security.' } },
      { id: 'p5-e2', order: 2, element_type: 'paragraph', content: { title: 'Mistake 1: Indexing every column individually', text: 'Single-column indexes rarely help multi-column WHERE clauses. PostgreSQL can combine them, but a composite index on the actual query pattern is almost always faster.' } },
      { id: 'p5-e3', order: 3, element_type: 'paragraph', content: { title: 'Mistake 2: Ignoring index column order', text: 'A composite index on <code>(status, created_at)</code> is useless for queries that filter only on <code>created_at</code>. Column order must match query patterns, leftmost first.' } },
      { id: 'p5-e4', order: 4, element_type: 'code_cluster', content: { title: 'Finding unused indexes', language: 'sql', code: 'SELECT indexrelname, idx_scan\nFROM pg_stat_user_indexes\nWHERE idx_scan = 0\nORDER BY pg_relation_size(indexrelid) DESC;' } },
      { id: 'p5-e5', order: 5, element_type: 'list_paragraph', content: { title: 'Quick wins', items: ['Run EXPLAIN ANALYZE on your slowest queries weekly.', 'Drop indexes with zero scans in the last 30 days.', 'Use partial indexes for soft-deleted or status-filtered rows.'] } },
      { id: 'p5-e6', order: 6, element_type: 'conclusion', content: { title: 'Conclusion', text: 'Good indexing is not about more indexes. It is about the right indexes for your actual query patterns.' } },
    ],
  },
  {
    id: 'post-6',
    slug: 'feature-flags-at-scale',
    title: 'Feature Flags at Scale: Beyond Boolean Toggles',
    excerpt: 'How we moved from simple on/off flags to percentage rollouts, user targeting, and experiment-driven releases.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Feature+Flags',
    published_at: '2025-11-05',
    elements: [
      { id: 'p6-e1', order: 1, element_type: 'introduction', content: { title: 'Feature flags changed how we ship', text: 'Deploying code and releasing a feature are two different decisions. Feature flags let you separate them.' } },
      { id: 'p6-e2', order: 2, element_type: 'paragraph', content: { title: 'Start simple: kill switches', text: 'Every outward-facing feature should have a kill switch. If something breaks in production, you turn it off without rolling back a deploy.' } },
      { id: 'p6-e3', order: 3, element_type: 'table', content: { title: 'Flag types', headers: ['Type', 'Use case', 'Lifecycle'], rows: [['Release', 'Gradual rollout', 'Days to weeks'], ['Experiment', 'A/B test', 'Weeks'], ['Ops', 'Kill switch', 'Permanent'], ['Permission', 'Entitlement gate', 'Permanent']] } },
      { id: 'p6-e4', order: 4, element_type: 'faq', content: { title: 'Common questions', items: [{ question: 'How do you avoid flag debt?', answer: 'Set expiry dates. If a release flag is still on after 30 days, it becomes permanent and the flag is removed.' }, { question: 'Should flags live in code or a service?', answer: 'A centralized flag service with local caching gives you real-time control without latency cost.' }] } },
      { id: 'p6-e5', order: 5, element_type: 'conclusion', content: { title: 'Conclusion', text: 'Flags are not just a deployment tool. They are a product development tool that reduces risk and increases learning speed.' } },
    ],
  },
  {
    id: 'post-7',
    slug: 'incident-response-playbook',
    title: 'Writing an Incident Response Playbook That People Actually Follow',
    excerpt: 'A practical template for incident response that works for teams of 5 or 500.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Incident+Response',
    published_at: '2025-10-18',
    elements: [
      { id: 'p7-e1', order: 1, element_type: 'introduction', content: { title: 'The playbook nobody reads', text: 'Most incident playbooks are 40-page PDFs nobody opens during a real incident. The best playbooks fit on one screen.' } },
      { id: 'p7-e2', order: 2, element_type: 'list_paragraph', content: { title: 'What every playbook needs', items: ['Severity definitions with concrete examples.', 'Who to page and when, not a phone tree — a decision tree.', 'Communication templates for customers and stakeholders.', 'A postmortem template that is filled out within 48 hours.'] } },
      { id: 'p7-e3', order: 3, element_type: 'quote', content: { text: 'If your playbook requires reading before you can act, it is a document, not a playbook.', attribution: 'Marcus Rivera, SRE Lead' } },
      { id: 'p7-e4', order: 4, element_type: 'timeline', content: { title: 'Incident lifecycle', items: [{ title: 'Detection', description: 'Automated alert fires or customer reports the issue.' }, { title: 'Triage', description: 'On-call determines severity and assembles the response team.' }, { title: 'Mitigation', description: 'Apply the quickest fix that restores service — even if temporary.' }, { title: 'Resolution', description: 'Deploy the permanent fix and verify recovery.' }, { title: 'Postmortem', description: 'Write up what happened, what went well, and what to improve.' }] } },
      { id: 'p7-e5', order: 5, element_type: 'checklist', content: { title: 'Postmortem checklist', introduction: 'Complete within 48 hours of resolution.', items: ['Timeline of events with timestamps', 'Root cause analysis', 'Customer impact assessment', 'Action items with owners and due dates', 'Communication review — what we told customers and when'] } },
      { id: 'p7-e6', order: 6, element_type: 'paragraph', content: { title: 'Run game days', text: 'A playbook that is never practiced is a liability. Run a monthly game day where you simulate a real incident and walk through the playbook. Fix what is confusing.' } },
      { id: 'p7-e7', order: 7, element_type: 'tool_recommendation', content: { name: 'PagerDuty', description: 'Incident management platform with on-call scheduling, automated escalation, and postmortem workflows.', use_case: 'Best for teams that need reliable alerting and stakeholder communication during incidents.' } },
      { id: 'p7-e8', order: 8, element_type: 'conclusion', content: { title: 'Conclusion', text: 'The goal is not documentation. The goal is that anyone on call at 3am can resolve an incident without guessing who to contact or what to check first.' } },
    ],
  },
  {
    id: 'post-8',
    slug: 'zero-downtime-deployments',
    title: 'Zero-Downtime Deployments: A Step-by-Step Guide',
    excerpt: 'Rolling deploys, blue-green, canary — which strategy fits your architecture and how to set each one up.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Zero+Downtime',
    published_at: '2025-10-02',
    elements: [
      { id: 'p8-e1', order: 1, element_type: 'introduction', content: { title: 'Downtime during deploys is a solved problem', text: 'If your users see errors every time you ship, you are solving the wrong problem. Zero-downtime deployment is table stakes.' } },
      { id: 'p8-e2', order: 2, element_type: 'paragraph', content: { title: 'Rolling deploys', text: 'Replace instances one at a time behind a load balancer. Simple and works for stateless services. Requires backward-compatible database changes.' } },
      { id: 'p8-e3', order: 3, element_type: 'paragraph', content: { title: 'Blue-green deploys', text: 'Run two identical environments. Route traffic to green while blue updates. Swap when ready. Doubles infrastructure cost but gives instant rollback.' } },
      { id: 'p8-e4', order: 4, element_type: 'table', content: { title: 'Strategy comparison', headers: ['Strategy', 'Rollback speed', 'Infra cost', 'Complexity'], rows: [['Rolling', 'Minutes', 'Low', 'Low'], ['Blue-green', 'Seconds', 'High', 'Medium'], ['Canary', 'Seconds', 'Medium', 'High']] } },
      { id: 'p8-e5', order: 5, element_type: 'pros_and_cons', content: { title: 'Canary deploys', pros: ['Catches regressions with real traffic before full rollout.', 'Supports automated rollback based on error rate thresholds.', 'Reduces blast radius of bad deployments.'], cons: ['Requires sophisticated traffic routing and monitoring.', 'Adds deployment pipeline complexity.', 'Slower rollout compared to blue-green switching.'] } },
      { id: 'p8-e6', order: 6, element_type: 'call_to_action', content: { title: 'Deploy with confidence', text: 'Try our deployment pipeline that handles rolling and canary strategies out of the box.', button_text: 'Learn more', button_url: '#' } },
      { id: 'p8-e7', order: 7, element_type: 'conclusion', content: { title: 'Conclusion', text: 'Pick the simplest strategy that meets your uptime requirements. Rolling is enough for most teams. Graduate to canary when you need traffic-based validation.' } },
    ],
  },
  {
    id: 'post-9',
    slug: 'api-versioning-strategies',
    title: 'API Versioning: URL Path vs Headers vs Content Negotiation',
    excerpt: 'Comparing the three main API versioning approaches with real trade-offs from production systems.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=API+Versioning',
    published_at: '2025-09-15',
    elements: [
      { id: 'p9-e1', order: 1, element_type: 'introduction', content: { title: 'Version your API before you need to', text: 'Adding versioning after breaking changes is painful. Designing it in from day one costs almost nothing.' } },
      { id: 'p9-e2', order: 2, element_type: 'paragraph', content: { title: 'URL path versioning', text: '<code>/v1/users</code> is the most common approach. It is explicit, cacheable, and easy to route. The downside: URL changes require client updates.' } },
      { id: 'p9-e3', order: 3, element_type: 'code_cluster', content: { title: 'Header-based versioning', language: 'http', code: 'GET /users HTTP/1.1\nHost: api.example.com\nAccept: application/vnd.example.v2+json' } },
      { id: 'p9-e4', order: 4, element_type: 'versus', content: { title: 'URL path vs header versioning', option_a: { name: 'URL Path (/v1/users)', points: ['Explicit and visible in URLs', 'Easy to cache at CDN level', 'Simple to implement and route', 'Breaking change for clients on upgrade'] }, option_b: { name: 'Header (Accept: vnd.v2+json)', points: ['Clean URLs that never change', 'Version negotiation at runtime', 'Harder to debug and test', 'CDN caching requires Vary header'] } } },
      { id: 'p9-e5', order: 5, element_type: 'faq', content: { title: 'FAQ', items: [{ question: 'Which approach does Stripe use?', answer: 'Stripe uses a date-based versioning header (Stripe-Version). Each API key is pinned to the version it was created on.' }, { question: 'Can I mix approaches?', answer: 'Yes, but consistency matters more than which approach you pick. Choose one and document it clearly.' }] } },
      { id: 'p9-e6', order: 6, element_type: 'glossary', content: { title: 'Key terms', items: [{ term: 'Breaking change', definition: 'A modification that requires consumers to update their integration code.' }, { term: 'Deprecation window', definition: 'The period between announcing a version sunset and actually removing it.' }, { term: 'Content negotiation', definition: 'Using HTTP headers to select the response format and version.' }] } },
      { id: 'p9-e7', order: 7, element_type: 'conclusion', content: { title: 'Conclusion', text: 'URL path versioning wins for simplicity. Header versioning wins for flexibility. Pick one, document the deprecation policy, and stick with it.' } },
    ],
  },
  {
    id: 'post-10',
    slug: 'multi-tenant-data-isolation',
    title: 'Multi-Tenant Data Isolation: Shared DB vs Schema vs Database',
    excerpt: 'The trade-offs between shared tables, per-tenant schemas, and fully isolated databases for SaaS platforms.',
    cover_image_url: 'https://placehold.co/1200x675/e5e7eb/6b7280?text=Multi-Tenant',
    published_at: '2025-09-01',
    elements: [
      { id: 'p10-e1', order: 1, element_type: 'introduction', content: { title: 'Tenancy model is a one-way door', text: 'Changing your data isolation strategy after launch is one of the hardest migrations in SaaS engineering. Get it right early.' } },
      { id: 'p10-e2', order: 2, element_type: 'table', content: { title: 'Isolation models compared', headers: ['Model', 'Isolation', 'Cost', 'Ops complexity'], rows: [['Shared table + tenant_id', 'Low', 'Low', 'Low'], ['Schema per tenant', 'Medium', 'Medium', 'Medium'], ['Database per tenant', 'High', 'High', 'High']] } },
      { id: 'p10-e3', order: 3, element_type: 'paragraph', content: { title: 'When shared tables are enough', text: 'For most B2B SaaS products, a <code>tenant_id</code> column with row-level security is sufficient. It scales well, keeps migrations simple, and costs the least to operate.' } },
      { id: 'p10-e4', order: 4, element_type: 'paragraph', content: { title: 'When you need full isolation', text: 'Regulated industries (healthcare, finance) or enterprise customers with contractual data residency requirements may need per-tenant databases. Budget for the operational overhead.' } },
      { id: 'p10-e5', order: 5, element_type: 'case_study', content: { title: 'Migrating from shared tables to schema-per-tenant', problem: 'A healthcare SaaS company needed to meet HIPAA data isolation requirements for a large hospital network customer. Their shared-table approach with RLS was not sufficient for the contractual audit requirements.', solution: 'They introduced schema-per-tenant for enterprise-tier customers while keeping shared tables for SMB customers. A routing layer in middleware reads the tenant config and connects to the correct schema.', result: 'Landed the hospital network contract ($2.4M ARR). Migration took 6 weeks. SMB customers were unaffected.' } },
      { id: 'p10-e6', order: 6, element_type: 'statistic', content: { value: '90%', label: 'of SaaS companies', description: 'Use shared tables with row-level security as their primary tenancy model according to a 2024 industry survey.' } },
      { id: 'p10-e7', order: 7, element_type: 'numbered_list_paragraph', content: { title: 'Migration checklist', items: ['Audit current data access patterns per tenant.', 'Define isolation requirements per customer tier.', 'Implement tenant-aware connection routing.', 'Add integration tests that verify cross-tenant data cannot leak.', 'Run parallel reads to validate data consistency during migration.'] } },
      { id: 'p10-e8', order: 8, element_type: 'snippet_block', content: { title: 'Key takeaway', text: 'The tenancy model is not a technical decision alone. It is a business decision that affects pricing, compliance posture, and operational cost. Match the isolation level to the customer segment.' } },
      { id: 'p10-e9', order: 9, element_type: 'product_recommendations', content: { title: 'Tools for multi-tenant PostgreSQL', introduction: 'These tools help manage tenant isolation at the database level.', products: [{ name: 'Citus', description: 'Distributed PostgreSQL extension that adds tenant-aware sharding to standard Postgres.' }, { name: 'pgBouncer', description: 'Lightweight connection pooler that supports routing connections by tenant schema.' }, { name: 'Row-Level Security (built-in)', description: 'PostgreSQL native feature that restricts row visibility per session variable.' }] } },
      { id: 'p10-e10', order: 10, element_type: 'quote', content: { text: 'Start with shared tables. Move to isolation when a customer contract requires it, not when an architect recommends it.', attribution: 'Engineering principle at Awesome SaaS' } },
      { id: 'p10-e11', order: 11, element_type: 'conclusion', content: { title: 'Conclusion', text: 'Shared tables with row-level security cover 90% of SaaS use cases. Reserve per-tenant isolation for compliance requirements, not theoretical security concerns.' } },
    ],
  },
]

export const EXAMPLE_DICTIONARY: ExampleDictionary = {
  id: 'awesome-saas-glossary',
  name: 'Awesome SaaS Glossary',
  description: 'Clear definitions of common SaaS and platform engineering terms.',
  word_count: 10,
  words: [
    {
      id: 'api',
      keyword: 'API',
      definition: {
        featured_snippet: 'An API is a contract that allows software systems to communicate through defined requests and responses.',
        paragraph_1: 'APIs let teams expose functionality without sharing implementation details. In SaaS, APIs power integrations, automation, and internal service-to-service communication.',
        paragraph_2: 'A well-designed API uses consistent naming, versioning, and error formats. This reduces support load and helps developers build reliable integrations faster.',
        paragraph_3: 'Modern API programs also include rate limits, authentication, observability, and lifecycle governance to avoid breaking customers unexpectedly.',
        synonyms: ['Interface', 'Service endpoint'],
        antonyms: ['Manual workflow'],
        usage_examples: ['Our billing API returns invoice status in real time.', 'Partners use the public API to sync CRM records.'],
        related_keywords: ['Webhook', 'Rate Limiting', 'Latency'],
        faqs: [
          { question: 'What is the difference between API and SDK?', answer: 'An API is the contract; an SDK is a toolkit that helps developers use that contract.' },
        ],
      },
    },
    {
      id: 'latency',
      keyword: 'Latency',
      definition: {
        featured_snippet: 'Latency is the time between a request and the corresponding response.',
        paragraph_1: 'Latency is usually measured in milliseconds and tracked as percentile distributions like p50, p95, and p99.',
        paragraph_2: 'Lower latency improves perceived product quality, especially for interactive actions such as search, checkout, and dashboards.',
        paragraph_3: 'Teams reduce latency through caching, payload optimization, regional deployments, and query tuning.',
        synonyms: ['Response time', 'Delay'],
        antonyms: ['Instantaneous response'],
        usage_examples: ['Our p95 latency dropped from 420ms to 180ms.', 'High latency on auth requests caused signup drop-off.'],
        related_keywords: ['CDN', 'Caching', 'SLA'],
        faqs: [{ question: 'Is low average latency enough?', answer: 'No. Tail latency (p95/p99) better captures real user pain.' }],
      },
    },
    {
      id: 'microservices',
      keyword: 'Microservices',
      definition: {
        featured_snippet: 'Microservices are an architectural style where applications are split into small, independently deployable services.',
        paragraph_1: 'Each service typically owns a specific business capability, such as billing or notifications.',
        paragraph_2: 'This model can improve team autonomy and deployment velocity but introduces complexity in communication, monitoring, and consistency.',
        paragraph_3: 'Organizations usually adopt microservices gradually, starting with the domains that benefit most from independent scaling.',
        synonyms: ['Service-oriented architecture'],
        antonyms: ['Monolith'],
        usage_examples: ['We extracted notifications into its own microservice.', 'Microservices helped us deploy billing updates without touching auth.'],
        related_keywords: ['Observability', 'API', 'Event-driven architecture'],
        faqs: [{ question: 'Are microservices always better?', answer: 'No. For many teams, a modular monolith is simpler and more cost-effective early on.' }],
      },
    },
    {
      id: 'cdn',
      keyword: 'CDN',
      definition: {
        featured_snippet: 'A CDN (Content Delivery Network) caches and serves content from edge locations close to end users.',
        paragraph_1: 'CDNs reduce latency for static assets such as images, scripts, and stylesheets.',
        paragraph_2: 'Many modern CDNs also support edge functions, request routing, and security controls like WAF rules.',
        paragraph_3: 'Using a CDN can significantly improve global performance and reduce origin server load.',
        synonyms: ['Edge cache network'],
        antonyms: ['Single-origin delivery'],
        usage_examples: ['Moving assets to a CDN improved page speed in APAC.', 'We use CDN rules to block abusive traffic patterns.'],
        related_keywords: ['Latency', 'Edge Computing', 'Caching'],
        faqs: [{ question: 'Does a CDN replace backend optimization?', answer: 'No. It helps at the edge but does not fix slow origin logic or databases.' }],
      },
    },
    {
      id: 'rate-limiting',
      keyword: 'Rate Limiting',
      definition: {
        featured_snippet: 'Rate limiting controls how many requests a client can make during a defined time window.',
        paragraph_1: 'It protects platform stability and prevents abuse by enforcing fair usage across customers.',
        paragraph_2: 'Common algorithms include token bucket, leaky bucket, and fixed or sliding windows.',
        paragraph_3: 'Transparent headers and error messages help developers recover gracefully when limits are exceeded.',
        synonyms: ['Request throttling'],
        antonyms: ['Unlimited access'],
        usage_examples: ['Free plans are limited to 60 requests per minute.', 'We added endpoint-specific rate limiting for login routes.'],
        related_keywords: ['API', 'Abuse Prevention', 'SLA'],
        faqs: [{ question: 'Can rate limits vary by plan?', answer: 'Yes, usage-based and tier-based limits are common in SaaS pricing.' }],
      },
    },
    {
      id: 'uptime',
      keyword: 'Uptime',
      definition: {
        featured_snippet: 'Uptime is the percentage of time a service is operational and available to users.',
        paragraph_1: 'Many SaaS companies publish uptime as part of reliability commitments.',
        paragraph_2: 'A 99.9% uptime target allows more downtime than 99.99%, so SLA wording matters.',
        paragraph_3: 'Reliable uptime depends on redundancy, incident response, and continuous testing.',
        synonyms: ['Availability'],
        antonyms: ['Downtime'],
        usage_examples: ['Our enterprise SLA guarantees 99.95% uptime.', 'A regional outage impacted uptime for 14 minutes.'],
        related_keywords: ['SLA', 'Failover', 'Incident Response'],
        faqs: [{ question: 'Is uptime the same as performance?', answer: 'No. A service can be up but still slow or degraded.' }],
      },
    },
    {
      id: 'webhook',
      keyword: 'Webhook',
      definition: {
        featured_snippet: 'A webhook is an HTTP callback that sends event data to another system in real time.',
        paragraph_1: 'Webhooks are useful when polling would be inefficient or too slow for business needs.',
        paragraph_2: 'Reliable webhook systems include retries, signature validation, and idempotent processing.',
        paragraph_3: 'Clear event schemas and delivery logs are essential for customer debugging.',
        synonyms: ['Event callback'],
        antonyms: ['Polling-only integration'],
        usage_examples: ['We fire a webhook when an invoice is paid.', 'Customers validate webhook signatures for security.'],
        related_keywords: ['API', 'Event-driven architecture', 'Idempotency'],
        faqs: [{ question: 'Why do webhooks fail?', answer: 'Network timeouts, endpoint errors, and invalid signatures are common causes.' }],
      },
    },
    {
      id: 'slo',
      keyword: 'SLO',
      definition: {
        featured_snippet: 'An SLO (Service Level Objective) is a target for reliability metrics such as latency or error rate.',
        paragraph_1: 'SLOs convert abstract reliability goals into measurable thresholds tied to user experience.',
        paragraph_2: 'Teams use error budgets to decide when to prioritize stability work versus new features.',
        paragraph_3: 'Good SLOs are specific, customer-relevant, and reviewed regularly with engineering and product.',
        synonyms: ['Reliability target'],
        antonyms: ['Undefined service expectations'],
        usage_examples: ['Checkout API has a 99.9% success-rate SLO.', 'We paused feature work after exceeding our error budget.'],
        related_keywords: ['SLA', 'Observability', 'Incident Response'],
        faqs: [{ question: 'How is SLO different from SLA?', answer: 'SLO is internal target-setting; SLA is an external contractual commitment.' }],
      },
    },
    {
      id: 'caching',
      keyword: 'Caching',
      definition: {
        featured_snippet: 'Caching stores previously computed data so future requests can be served faster.',
        paragraph_1: 'Caches can exist in browsers, CDNs, application layers, or databases.',
        paragraph_2: 'The trade-off is freshness: stale data risk increases as TTL grows.',
        paragraph_3: 'Strong cache key design and invalidation strategy are critical for correctness.',
        synonyms: ['Temporary storage'],
        antonyms: ['Always recomputing'],
        usage_examples: ['We cached pricing metadata for 5 minutes.', 'Redis caching reduced database load by 40%.'],
        related_keywords: ['CDN', 'Latency', 'TTL'],
        faqs: [{ question: 'What is hard about caching?', answer: 'Cache invalidation and consistency across distributed systems.' }],
      },
    },
    {
      id: 'edge-computing',
      keyword: 'Edge Computing',
      definition: {
        featured_snippet: 'Edge computing runs workloads near users instead of a centralized region to reduce latency.',
        paragraph_1: 'Typical edge use cases include personalization, geolocation-based routing, and lightweight API logic.',
        paragraph_2: 'Edge execution improves responsiveness but may impose runtime limits and state constraints.',
        paragraph_3: 'Architectures often combine edge processing with centralized data systems for consistency.',
        synonyms: ['Distributed edge execution'],
        antonyms: ['Centralized-only compute'],
        usage_examples: ['We moved auth token checks to the edge.', 'Edge middleware improved first-byte time globally.'],
        related_keywords: ['CDN', 'Latency', 'Multi-region'],
        faqs: [{ question: 'Can edge replace backend servers?', answer: 'Not fully. Edge excels at low-latency logic, while core systems still run centrally.' }],
      },
    },
  ],
}
