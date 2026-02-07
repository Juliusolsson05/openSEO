'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiPut } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface PostInfo {
  id: number
  seo_title: string
  meta_description: string
  focus_keyword: string
  elements: any[]
}

interface PostInfoSidepanelProps {
  post: PostInfo | null
  onToggleHighlight?: (enabled: boolean) => void
  onUpdatePost?: (post: PostInfo) => void
}

const TITLE_MAX = 60
const META_MAX = 160

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const flattenText = (value: any): string => {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(flattenText).join(' ')
  if (typeof value === 'object') return Object.values(value).map(flattenText).join(' ')
  return ''
}

const keywordCountInText = (text: string, keyword: string): number => {
  if (!keyword.trim()) return 0
  const matches = text.match(new RegExp(escapeRegExp(keyword.trim()), 'gi'))
  return matches?.length ?? 0
}

const renderWithHighlightAndOverflow = (
  text: string,
  maxLength: number,
  keyword: string,
  highlight: boolean
) => {
  const source = text || ''
  const regex = highlight && keyword.trim() ? new RegExp(`(${escapeRegExp(keyword.trim())})`, 'gi') : null
  const parts = regex ? source.split(regex) : [source]

  let cursor = 0
  return parts.map((part, idx) => {
    const start = cursor
    const end = start + part.length
    cursor = end

    const isKeyword = Boolean(regex && idx % 2 === 1)
    const inOverflow = start >= maxLength
    const crossing = start < maxLength && end > maxLength

    if (crossing) {
      const normalPart = part.slice(0, maxLength - start)
      const overflowPart = part.slice(maxLength - start)
      return (
        <span key={`${idx}-${start}`}>
          {normalPart && (
            <span className={isKeyword ? 'rounded-sm bg-yellow-200 px-0.5' : ''}>{normalPart}</span>
          )}
          {overflowPart && (
            <span className={isKeyword ? 'rounded-sm bg-yellow-200/70 px-0.5 text-red-700' : 'text-red-700'}>{overflowPart}</span>
          )}
        </span>
      )
    }

    return (
      <span
        key={`${idx}-${start}`}
        className={[
          isKeyword ? 'rounded-sm bg-yellow-200 px-0.5' : '',
          inOverflow ? 'text-red-700' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {part}
      </span>
    )
  })
}

export default function PostInfoSidepanel({
  post,
  onToggleHighlight,
  onUpdatePost,
}: PostInfoSidepanelProps) {
  const [highlightKeywords, setHighlightKeywords] = useState(false)
  const [seoDialogOpen, setSeoDialogOpen] = useState(false)
  const [metaDialogOpen, setMetaDialogOpen] = useState(false)
  const [editedSeoTitle, setEditedSeoTitle] = useState('')
  const [editedMetaDescription, setEditedMetaDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setHighlightKeywords(false)
  }, [post?.id])

  const keywordCount = useMemo(() => {
    if (!post?.focus_keyword) return 0
    const text = flattenText(post.elements)
    return keywordCountInText(text, post.focus_keyword)
  }, [post?.elements, post?.focus_keyword])

  const toggleHighlight = (checked: boolean) => {
    setHighlightKeywords(checked)
    onToggleHighlight?.(checked)
  }

  const saveSeoTitle = async () => {
    if (!post || editedSeoTitle.length > TITLE_MAX) return
    setSaving(true)
    const { data } = await apiPut<PostInfo>(
      `/api/aurora/blog/posts/update_meta/?post_id=${post.id}`,
      { seo_title: editedSeoTitle }
    )
    if (data) onUpdatePost?.({ ...post, ...data, seo_title: data.seo_title ?? editedSeoTitle })
    setSaving(false)
    setSeoDialogOpen(false)
  }

  const saveMetaDescription = async () => {
    if (!post || editedMetaDescription.length > META_MAX) return
    setSaving(true)
    const { data } = await apiPut<PostInfo>(
      `/api/aurora/blog/posts/update_meta/?post_id=${post.id}`,
      { meta_description: editedMetaDescription }
    )
    if (data) {
      onUpdatePost?.({
        ...post,
        ...data,
        meta_description: data.meta_description ?? editedMetaDescription,
      })
    }
    setSaving(false)
    setMetaDialogOpen(false)
  }

  if (!post) return null

  return (
    <>
      <Card className="rounded border-border bg-white shadow-none" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <CardHeader>
          <CardTitle className="text-[15px]">Post Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-[13px]">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">SEO title</p>
              <Button
                variant="outline"
                className="h-7 rounded-sm border-border px-2 text-[12px]"
                onClick={() => {
                  setEditedSeoTitle(post.seo_title || '')
                  setSeoDialogOpen(true)
                }}
              >
                Edit
              </Button>
            </div>
            <div className="rounded-sm border border-border bg-background p-2">
              {renderWithHighlightAndOverflow(post.seo_title || '', TITLE_MAX, post.focus_keyword || '', highlightKeywords)}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Meta description</p>
              <Button
                variant="outline"
                className="h-7 rounded-sm border-border px-2 text-[12px]"
                onClick={() => {
                  setEditedMetaDescription(post.meta_description || '')
                  setMetaDialogOpen(true)
                }}
              >
                Edit
              </Button>
            </div>
            <div className="rounded-sm border border-border bg-background p-2">
              {renderWithHighlightAndOverflow(
                post.meta_description || '',
                META_MAX,
                post.focus_keyword || '',
                highlightKeywords
              )}
            </div>
          </div>

          <div className="rounded-sm border border-border bg-background p-2">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Focus keyword</p>
            <p className="mt-1">{post.focus_keyword || '-'}</p>
          </div>

          <div className="rounded-sm border border-border bg-background p-2">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Keyword count</p>
            <p className="mt-1">{keywordCount}</p>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={highlightKeywords}
              onChange={(e) => toggleHighlight(e.target.checked)}
            />
            <span className="text-[13px]">Highlight focus keywords</span>
          </label>
        </CardContent>
      </Card>

      {seoDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded border border-border bg-white p-4">
            <h3 className="text-[14px] font-semibold">Edit SEO Title</h3>
            <div className="mt-3 space-y-1">
              <Input
                value={editedSeoTitle}
                onChange={(e) => setEditedSeoTitle(e.target.value)}
                className="h-8 rounded-sm border-border text-[13px]"
              />
              <p className={`text-right text-[12px] ${editedSeoTitle.length > TITLE_MAX ? 'text-red-600' : 'text-muted-foreground'}`}>
                {editedSeoTitle.length}/{TITLE_MAX}
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSeoDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button
                onClick={saveSeoTitle}
                disabled={saving || editedSeoTitle.length > TITLE_MAX}
                className="bg-primary hover:bg-primary-hover"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {metaDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded border border-border bg-white p-4">
            <h3 className="text-[14px] font-semibold">Edit Meta Description</h3>
            <div className="mt-3 space-y-1">
              <textarea
                value={editedMetaDescription}
                onChange={(e) => setEditedMetaDescription(e.target.value)}
                className="min-h-[120px] w-full rounded-sm border border-border px-3 py-2 text-[13px] outline-none focus:border-primary"
              />
              <p className={`text-right text-[12px] ${editedMetaDescription.length > META_MAX ? 'text-red-600' : 'text-muted-foreground'}`}>
                {editedMetaDescription.length}/{META_MAX}
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMetaDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button
                onClick={saveMetaDescription}
                disabled={saving || editedMetaDescription.length > META_MAX}
                className="bg-primary hover:bg-primary-hover"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
