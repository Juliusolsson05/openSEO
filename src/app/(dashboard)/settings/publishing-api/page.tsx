import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const samplePayload = {
  event: 'blog.post.upload',
  timestamp: '2026-02-07T15:00:00.000Z',
  payload: {
    post: {
      id: 123,
      title_text: 'How to Improve Conversion Rate',
      slug: 'how-to-improve-conversion-rate',
      seo_title: 'How to Improve Conversion Rate in 7 Steps',
      focus_keyword: 'conversion rate optimization',
      excerpt: 'A practical guide to improve conversion performance.',
      meta_description: 'Learn 7 practical CRO steps to improve conversion rates.',
      categories: ['SEO', 'Analytics'],
    },
    processed_content: {
      id: 123,
      elements: [
        { element_type: 'introduction', order: 1, content: { text: '...' } },
        { element_type: 'paragraph', order: 2, content: { title: '...', text: '...' } },
      ],
    },
  },
}

export default function PublishingApiDocsPage() {
  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Publishing API Documentation</h1>
        <Link href="/settings" className="text-sm text-primary hover:underline">Back to settings</Link>
      </div>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>How delivery works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Aurora sends a <Badge variant="outline">POST</Badge> request with JSON to your configured <code>api_endpoint</code>.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Header: <code>Content-Type: application/json</code></li>
            <li>Optional header: <code>Authorization: Bearer {'<api_key>'}</code> (if configured)</li>
            <li>Body format: <code>{`{ event, timestamp, payload }`}</code></li>
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Expected endpoint behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Your endpoint should:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Accept JSON POST requests.</li>
            <li>Return a 2xx status code on success.</li>
            <li>Optionally return JSON including <code>delivery_id</code>, <code>remote_id</code>, or <code>id</code>.</li>
          </ul>
          <p>Aurora stores that returned identifier as the remote publish ID.</p>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Sample payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-sm border border-border bg-secondary/30 p-3 text-xs">{JSON.stringify(samplePayload, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Inbound sync security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Create an inbound API key in Aurora and send it as one of:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><code>Authorization: Bearer {'<aurora_inbound_key>'}</code></li>
            <li><code>X-Aurora-Inbound-Key: {'<aurora_inbound_key>'}</code></li>
          </ul>
          <p>Inbound endpoint currently available:</p>
          <p><code>POST /api/v1/publishing/inbound/post/upsert</code></p>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><Badge variant="outline">blog.post.upload</Badge> Sent when upload/export-to-endpoint is executed.</p>
          <p><Badge variant="outline">blog.post.export</Badge> Sent for third-party export endpoints.</p>
          <p><Badge variant="outline">post.upsert</Badge> Recommended inbound event for client → Aurora sync.</p>
        </CardContent>
      </Card>
    </div>
  )
}
