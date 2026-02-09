'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import type { OversizedSeoTitle, OversizedMetaDescription } from '@/types/analytics'

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
        <Table className="w-full text-left text-[12px]">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="border-b border-border px-3 py-2">Post ID</TableHead>
              <TableHead className="border-b border-border px-3 py-2">Title/Description</TableHead>
              <TableHead className="border-b border-border px-3 py-2">Focus Keyword</TableHead>
              <TableHead className="border-b border-border px-3 py-2">Extra Characters</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.post_id}-${row.extra_chars}`}>
                <TableCell className="border-b border-border px-3 py-2">{row.post_id}</TableCell>
                <TableCell className={`border-b border-border px-3 py-2 ${highlight ? 'bg-destructive/10' : ''}`}>
                  {getText(row)}
                </TableCell>
                <TableCell className="border-b border-border px-3 py-2">{row.focus_keyword}</TableCell>
                <TableCell className="border-b border-border px-3 py-2">{row.extra_chars}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  No issues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
