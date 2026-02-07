'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OversizedSeoTitle {
  post_id: number
  title: string
  focus_keyword: string
  extra_chars: number
}

interface OversizedMetaDescription {
  post_id: number
  meta_description: string
  focus_keyword: string
  extra_chars: number
}

interface PostMetaProps {
  oversizedSeoTitles: OversizedSeoTitle[]
  oversizedMetaDescriptions: OversizedMetaDescription[]
}

function DataTable<T extends OversizedSeoTitle | OversizedMetaDescription>({
  heading,
  rows,
  getText,
  highlight,
}: {
  heading: string
  rows: T[]
  getText: (row: T) => string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide">{heading}</p>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-muted">
            <tr>
              <th className="border-b border-border px-3 py-2">Post ID</th>
              <th className="border-b border-border px-3 py-2">Title/Description</th>
              <th className="border-b border-border px-3 py-2">Focus Keyword</th>
              <th className="border-b border-border px-3 py-2">Extra Characters</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.post_id}-${row.extra_chars}`}>
                <td className="border-b border-border px-3 py-2">{row.post_id}</td>
                <td className={`border-b border-border px-3 py-2 ${highlight ? 'bg-destructive/10' : ''}`}>
                  {getText(row)}
                </td>
                <td className="border-b border-border px-3 py-2">{row.focus_keyword}</td>
                <td className="border-b border-border px-3 py-2">{row.extra_chars}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  No issues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function PostMeta({ oversizedSeoTitles, oversizedMetaDescriptions }: PostMetaProps) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Post meta issues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <DataTable heading="Oversized SEO Titles" rows={oversizedSeoTitles} getText={(row) => row.title} highlight />
        <DataTable heading="Oversized Meta Descriptions" rows={oversizedMetaDescriptions} getText={(row) => row.meta_description} />
      </CardContent>
    </Card>
  )
}
