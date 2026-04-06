export type HyperlinkMatch = {
  keyword: string
  description: string
  matched_positions?: Array<[number, number]> | number[]
}

export type HyperlinkData = {
  matched_keywords?: Record<string, HyperlinkMatch[] | Array<{ question?: HyperlinkMatch[]; answer?: HyperlinkMatch[] }>>
} | null

type OffsetSpan = { start: number; end: number; keyword: string }

/** Treat an entry as an [start, end) tuple iff it's a 2-element array of numbers. */
function isOffsetTuple(x: unknown): x is [number, number] {
  return Array.isArray(x) && x.length === 2 && typeof x[0] === 'number' && typeof x[1] === 'number'
}

function collectOffsetSpans(keywords: HyperlinkMatch[]): OffsetSpan[] {
  const spans: OffsetSpan[] = []
  for (const kw of keywords) {
    const mp = kw.matched_positions
    if (!Array.isArray(mp) || mp.length === 0) continue
    for (const entry of mp) {
      if (isOffsetTuple(entry)) {
        const [start, end] = entry
        if (Number.isFinite(start) && Number.isFinite(end) && end > start && start >= 0) {
          spans.push({ start, end, keyword: kw.keyword })
        }
      }
    }
  }
  return spans
}

function anchorFor(keyword: string, displayText: string): string {
  return `<a href="/dictionary/${encodeURIComponent(keyword)}" class="hyperlink">${displayText}</a>`
}

/**
 * Splice <a> tags into `text` using the exact [start, end) offsets in `spans`.
 * Walks end -> start so splices never invalidate earlier offsets. Drops spans
 * that overlap an already-applied span (first-wins after sorting by start ASC).
 */
function spliceByOffsets(text: string, spans: OffsetSpan[]): string {
  if (spans.length === 0) return text

  // Sort ascending by start, drop overlaps (first wins).
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end)
  const nonOverlapping: OffsetSpan[] = []
  let lastEnd = -1
  for (const s of sorted) {
    if (s.start >= lastEnd && s.end <= text.length) {
      nonOverlapping.push(s)
      lastEnd = s.end
    }
  }

  // Walk end -> start so splices don't shift remaining indices.
  let result = text
  for (let i = nonOverlapping.length - 1; i >= 0; i--) {
    const { start, end, keyword } = nonOverlapping[i]
    const surface = result.slice(start, end)
    result = result.slice(0, start) + anchorFor(keyword, surface) + result.slice(end)
  }
  return result
}

/**
 * Legacy fallback used when no `matched_positions` tuples are present.
 * Tokenizes `text` by whitespace and links tokens whose clean form matches a
 * keyword. Kept intact for rows written before the offset-tuple migration.
 */
function legacyTokenizerLink(text: string, keywords: HyperlinkMatch[]): string {
  const keywordMap: Record<string, string> = keywords.reduce((acc, { keyword }) => {
    acc[keyword.toLowerCase()] = keyword
    return acc
  }, {} as Record<string, string>)

  const words = text.split(/(\s+)/)

  const hyperlinkedWords = words.map((word, i) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/gi, '')
    if (keywordMap[cleanWord]) {
      const nextWord = words[i + 2]
      const nextCleanWord = nextWord ? nextWord.toLowerCase().replace(/[^a-z0-9]/gi, '') : ''
      if (!keywordMap[nextCleanWord]) {
        const originalKeyword = keywordMap[cleanWord]
        const match = word.match(/^([^\w]*)([\w]+)([^\w]*)$/)
        if (match) {
          const [, before, mainWord, after] = match
          return `${before}${anchorFor(originalKeyword, mainWord)}${after}`
        }
        return anchorFor(originalKeyword, word)
      }
    }
    return word
  })

  return hyperlinkedWords.join('')
}

/**
 * Takes a text string and an array of keyword matches, returns the text with
 * matching keywords wrapped in <a class="hyperlink"> tags.
 *
 * Uses `matched_positions` when it contains [start, end) character tuples.
 * Falls back to a whitespace tokenizer for legacy rows that stored word
 * indices or for matches with no positions at all.
 */
export function createHyperlinkedText(text: string, keywords: HyperlinkMatch[]): string {
  if (!keywords?.length || !text) return text

  const spans = collectOffsetSpans(keywords)
  if (spans.length > 0) return spliceByOffsets(text, spans)

  return legacyTokenizerLink(text, keywords)
}

/** Apply hyperlinks to a text field if keywords exist for that field. */
export function applyHyperlinks(text: string, hyperlink: HyperlinkData | undefined | null, field: string): string {
  if (!text || !hyperlink?.matched_keywords) return text
  const keywords = (hyperlink.matched_keywords as Record<string, HyperlinkMatch[]>)[field]
  if (!Array.isArray(keywords) || !keywords.length) return text
  return createHyperlinkedText(text, keywords)
}
