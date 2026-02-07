export type HyperlinkMatch = {
  keyword: string
  description: string
  matched_positions: number[]
}

export type HyperlinkData = {
  matched_keywords?: Record<string, HyperlinkMatch[] | Array<{ question?: HyperlinkMatch[]; answer?: HyperlinkMatch[] }>>
} | null

/**
 * Takes a text string and an array of keyword matches, returns the text
 * with matching keywords wrapped in <a class="hyperlink"> tags.
 */
export function createHyperlinkedText(text: string, keywords: HyperlinkMatch[]): string {
  if (!keywords?.length || !text) return text

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
          return `${before}<a href="/dictionary/${encodeURIComponent(originalKeyword)}" class="hyperlink">${mainWord}</a>${after}`
        }

        return `<a href="/dictionary/${encodeURIComponent(originalKeyword)}" class="hyperlink">${word}</a>`
      }
    }

    return word
  })

  return hyperlinkedWords.join('')
}

/**
 * Apply hyperlinks to a text field if keywords exist for that field.
 */
export function applyHyperlinks(text: string, hyperlink: HyperlinkData | undefined | null, field: string): string {
  if (!text || !hyperlink?.matched_keywords) return text
  const keywords = (hyperlink.matched_keywords as Record<string, HyperlinkMatch[]>)[field]
  if (!Array.isArray(keywords) || !keywords.length) return text
  return createHyperlinkedText(text, keywords)
}
