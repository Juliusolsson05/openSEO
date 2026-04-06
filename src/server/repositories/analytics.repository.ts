import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export function getLatestLog(companyId: number) {
  return prisma.analyticsLog.findFirst({
    where: { companyId },
    orderBy: { created_at: 'desc' },
  })
}

export function createLog(data: { companyId: number; json_data: Prisma.InputJsonValue; last_synced?: Date }) {
  return prisma.analyticsLog.create({
    data: {
      companyId: data.companyId,
      json_data: data.json_data as Prisma.InputJsonValue,
      ...(data.last_synced ? { last_synced: data.last_synced } : {}),
    },
  })
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ')
}

function normalizeText(input: unknown): string {
  if (input == null) return ''
  if (typeof input === 'string') return stripHtml(input)
  if (typeof input === 'number' || typeof input === 'boolean') return String(input)
  if (Array.isArray(input)) return input.map((item) => normalizeText(item)).join(' ')
  if (typeof input === 'object') {
    return Object.values(input as Record<string, unknown>)
      .map((value) => normalizeText(value))
      .join(' ')
  }
  return ''
}

function extractElementText(elementType: string, content: unknown): string {
  const c = (content ?? {}) as Record<string, unknown>
  const byType: Record<string, unknown[]> = {
    paragraph: [c.text],
    introduction: [c.text],
    conclusion: [c.text],
    heading: [c.text, c.title],
    faq: [c.question, c.answer],
    list_paragraph: [c.text_before_list, c.list_items, c.text_after_list],
    list: [c.title, c.items, c.list_items],
    quote: [c.quote, c.author],
    case_study: [c.title, c.description, c.text],
    tool_recommendation: [c.tool_name, c.description, c.text],
    checklist: [c.title, c.items],
    cta: [c.title, c.description],
  }

  const type = elementType.toLowerCase()
  const mapped = byType[type]
  if (mapped) return mapped.map((v) => normalizeText(v)).join(' ')
  return normalizeText(content)
}

function countWords(text: string): number {
  const clean = stripHtml(text)
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return 0
  return clean.split(' ').length
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countKeywordOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0
  const re = new RegExp(escapeRegex(keyword.trim()), 'gi')
  return (stripHtml(text).match(re) ?? []).length
}

/**
 * Walks a `matched_keywords` JSON value (as stored on ElementHyperlink) and
 * yields the keyword string of each leaf match. The shape is typically:
 *   { text: [{ keyword, ... }, ...], title: [...], list_items: [[...], ...],
 *     question: [...], answer: [...], ... }
 * but can also be a flat array or a raw string. We defensively walk anything
 * that looks like an object/array and treat any leaf with a `keyword` property
 * as a match. Bare strings are treated as their own keyword.
 */
function* iterateMatchedKeywords(value: unknown): Generator<string> {
  if (value == null) return
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed) yield trimmed
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) yield* iterateMatchedKeywords(item)
    return
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    // If this looks like a leaf match ({ keyword, ... }), yield its keyword.
    if (typeof obj.keyword === 'string' && obj.keyword.trim()) {
      yield obj.keyword.trim()
      return
    }
    // Otherwise recurse into every value (field-name keyed container).
    for (const v of Object.values(obj)) yield* iterateMatchedKeywords(v)
  }
}

function toMatchedKeywordCount(value: unknown): number {
  let count = 0
  for (const _ of iterateMatchedKeywords(value)) count += 1
  return count
}

function round(value: number, digits = 2): number {
  const m = 10 ** digits
  return Math.round(value * m) / m
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function scoreByRange(
  value: number,
  optimalMin: number,
  optimalMax: number,
  lowScale: number,
  highPenalty: (v: number) => number,
): number {
  if (value >= optimalMin && value <= optimalMax) return 100
  if (value < optimalMin) return clamp((value / optimalMin) * lowScale)
  return clamp(highPenalty(value))
}

function metric(value: number, description: string, method: string, recommendation?: string) {
  return {
    value,
    value_description: description,
    computation_method: method,
    ...(recommendation ? { value_recommendation: recommendation } : {}),
  }
}

function scoreRecommendation(score: number): string {
  if (score >= 90) return 'Excellent. Keep maintaining this level.'
  if (score >= 75) return 'Good. Minor optimizations can still help.'
  if (score >= 50) return 'Average. Improvements recommended.'
  return 'Needs improvement. Optimize this metric.'
}

export async function getBlogPostReadability(companyId: number, blogPostId?: number) {
  const elements = await prisma.blogPostElement.findMany({
    where: {
      blog_post: { companyId },
      ...(blogPostId ? { blogPostId } : {}),
    },
    select: { id: true, blogPostId: true, element_type: true, content: true },
    orderBy: [{ blogPostId: 'asc' }, { order: 'asc' }],
  })

  const countSyllables = (word: string): number => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '')
    if (!clean) return 0
    const groups = clean.match(/[aeiouy]+/g)
    const base = groups?.length ?? 1
    if (clean.length > 2 && clean.endsWith('e')) return Math.max(1, base - 1)
    return Math.max(1, base)
  }

  const details = elements.map((element) => {
    const text = extractElementText(element.element_type, element.content)
    const plain = stripHtml(text).replace(/\s+/g, ' ').trim()
    const words = plain ? plain.split(' ').filter(Boolean) : []
    const sentences = plain
      ? plain
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const wordCount = words.length
    const sentenceCount = Math.max(sentences.length, 1)
    const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0)
    const avgWordsPerSentence = wordCount ? wordCount / sentenceCount : 0
    const avgSyllablesPerWord = wordCount ? syllableCount / wordCount : 0
    const flesch = round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord, 2)

    return {
      element_id: element.id,
      blog_post_id: element.blogPostId,
      element_type: element.element_type.toLowerCase(),
      words: wordCount,
      sentences: sentences.length,
      avg_words_per_sentence: round(avgWordsPerSentence, 2),
      avg_syllables_per_word: round(avgSyllablesPerWord, 2),
      readability_score: flesch,
    }
  })

  const byPost = new Map<number, number[]>()
  for (const item of details) {
    const existing = byPost.get(item.blog_post_id) ?? []
    existing.push(item.readability_score)
    byPost.set(item.blog_post_id, existing)
  }

  const posts = [...byPost.entries()].map(([postId, scores]) => ({
    blog_post_id: postId,
    readability_score: round(scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1), 2),
    samples: scores.length,
  }))

  const overall = details.length
    ? round(details.reduce((sum, item) => sum + item.readability_score, 0) / details.length, 2)
    : null

  return {
    overall_readability_score: overall,
    posts,
    elements: details,
  }
}

export async function getGeneralBlogAnalytics(companyId: number, includeRecommendations = true) {
  const posts = await prisma.blogPost.findMany({
    where: { companyId },
    select: {
      id: true,
      focus_keyword: true,
      elements: {
        select: {
          id: true,
          element_type: true,
          content: true,
          hyperlink: { select: { matched_keywords: true } },
        },
      },
      post_linking_from: {
        where: { toBlogPost: { status: { in: ['GENERATED', 'PUBLISHED'] } } },
        select: { toBlogPostId: true },
      },
      publishes: { select: { id: true } },
    },
  })

  const totalBlogPosts = posts.length
  const publishedBlogPosts = posts.filter((post) => post.publishes.length > 0).length

  const focusKeywords = [...new Set(posts.map((p) => (p.focus_keyword ?? '').trim()).filter(Boolean))]

  const postStats = posts.map((post) => {
    let words = 0
    let keywordHits = 0
    let internalLinks = 0
    let toolRecommendations = 0
    let caseStudies = 0

    for (const element of post.elements) {
      const text = extractElementText(element.element_type, element.content)
      words += countWords(text)
      keywordHits += countKeywordOccurrences(text, post.focus_keyword ?? '')
      internalLinks += toMatchedKeywordCount(element.hyperlink?.matched_keywords)

      const type = element.element_type.toLowerCase()
      if (type === 'tool_recommendation') toolRecommendations += 1
      if (type === 'case_study') caseStudies += 1
    }

    const outgoingLinks = post.post_linking_from.length
    const totalLinks = internalLinks + outgoingLinks
    const keywordDensity = words > 0 ? (keywordHits / words) * 100 : 0
    const linkDensity = words > 0 ? (totalLinks / words) * 100 : 0

    return {
      words,
      keywordDensity,
      linkDensity,
      totalLinks,
      internalLinks,
      outgoingLinks,
      toolRecommendations,
      caseStudies,
    }
  })

  const avg = (selector: (item: (typeof postStats)[number]) => number) =>
    postStats.length ? postStats.reduce((sum, item) => sum + selector(item), 0) / postStats.length : 0

  const averagePostLength = round(avg((p) => p.words), 2)
  const averageKeywordDensity = round(avg((p) => p.keywordDensity), 2)
  const averageLinkDensity = round(avg((p) => p.linkDensity), 2)
  const averageTotalLinks = round(avg((p) => p.totalLinks), 2)
  const averageInternalLinks = round(avg((p) => p.internalLinks), 2)
  const averageOutgoingLinks = round(avg((p) => p.outgoingLinks), 2)
  const averageToolRecommendations = round(avg((p) => p.toolRecommendations), 2)
  const averageCaseStudies = round(avg((p) => p.caseStudies), 3)

  const weights = {
    average_keyword_density: 20,
    average_link_density: 15,
    average_post_length: 15,
    average_total_links: 10,
    average_internal_links: 10,
    average_outgoing_links: 10,
    average_tool_recommendations: 10,
    average_case_studies: 10,
  }

  const scoreBreakdown = {
    average_keyword_density: {
      score: round(scoreByRange(averageKeywordDensity, 1, 2, 75, (v) => 100 - (v - 2) * 10), 2),
      weight: weights.average_keyword_density,
    },
    average_link_density: {
      score: round(scoreByRange(averageLinkDensity, 1, 3, 75, (v) => 100 - (v - 3) * 10), 2),
      weight: weights.average_link_density,
    },
    average_post_length: {
      score: round(scoreByRange(averagePostLength, 1500, 2500, 75, (v) => 100 - ((v - 2500) / 500) * 10), 2),
      weight: weights.average_post_length,
    },
    average_total_links: {
      score: round(scoreByRange(averageTotalLinks, 5, 10, 75, () => 100), 2),
      weight: weights.average_total_links,
    },
    average_internal_links: {
      score: round(scoreByRange(averageInternalLinks, 3, 5, 75, () => 100), 2),
      weight: weights.average_internal_links,
    },
    average_outgoing_links: {
      score: round(scoreByRange(averageOutgoingLinks, 2, 4, 75, (v) => 100 - ((v - 4) / 2) * 10), 2),
      weight: weights.average_outgoing_links,
    },
    average_tool_recommendations: {
      score: round(scoreByRange(averageToolRecommendations, 1, 2, 75, (v) => 100 - (v - 2) * 5), 2),
      weight: weights.average_tool_recommendations,
    },
    average_case_studies: {
      score: round(scoreByRange(averageCaseStudies, 0.2, 0.333, 75, (v) => 100 - ((v - 0.333) / 0.167) * 5), 2),
      weight: weights.average_case_studies,
    },
  }

  const weightedSum = Object.values(scoreBreakdown).reduce((sum, entry) => sum + (entry.score * entry.weight) / 100, 0)
  const generalSeoScore = round(clamp(weightedSum, 0, 100), 2)

  const maybeRecommendation = (score: number) => (includeRecommendations ? scoreRecommendation(score) : undefined)

  return {
    total_blog_posts: metric(
      totalBlogPosts,
      'Total number of blog posts for the company.',
      'Count of BlogPost records filtered by companyId.',
      includeRecommendations ? 'Increase content volume steadily while maintaining quality.' : undefined,
    ),
    published_blog_posts: metric(
      publishedBlogPosts,
      'Number of blog posts that have been published.',
      'Count BlogPost items that have at least one BlogPublish relation.',
      includeRecommendations ? 'Increase publication frequency for ready posts.' : undefined,
    ),
    average_post_length: metric(
      averagePostLength,
      'Average words per blog post.',
      'For each post, sum words from all elements; average across posts.',
      maybeRecommendation(scoreBreakdown.average_post_length.score),
    ),
    average_keyword_density: metric(
      averageKeywordDensity,
      'Average focus keyword density (%).',
      'Keyword occurrences / total words * 100 per post, then averaged.',
      maybeRecommendation(scoreBreakdown.average_keyword_density.score),
    ),
    average_link_density: metric(
      averageLinkDensity,
      'Average link density (%).',
      'Total links (internal + outgoing) / total words * 100 per post, then averaged.',
      maybeRecommendation(scoreBreakdown.average_link_density.score),
    ),
    average_total_links: metric(
      averageTotalLinks,
      'Average total links per post.',
      'Internal links + outgoing related-post links per post, then averaged.',
      maybeRecommendation(scoreBreakdown.average_total_links.score),
    ),
    average_internal_links: metric(
      averageInternalLinks,
      'Average internal links per post.',
      'Count of matched_keywords in ElementHyperlink across post elements, averaged.',
      maybeRecommendation(scoreBreakdown.average_internal_links.score),
    ),
    average_outgoing_links: metric(
      averageOutgoingLinks,
      'Average outgoing links per post.',
      'Count of related post links via BlogPostPostLink (post_linking_from), averaged.',
      maybeRecommendation(scoreBreakdown.average_outgoing_links.score),
    ),
    average_tool_recommendations: metric(
      averageToolRecommendations,
      'Average tool recommendation elements per post.',
      'Count BlogPostElement with element_type TOOL_RECOMMENDATION per post, then averaged.',
      maybeRecommendation(scoreBreakdown.average_tool_recommendations.score),
    ),
    average_case_studies: metric(
      averageCaseStudies,
      'Average case study elements per post.',
      'Count BlogPostElement with element_type CASE_STUDY per post, then averaged.',
      maybeRecommendation(scoreBreakdown.average_case_studies.score),
    ),
    focus_keywords: focusKeywords,
    general_seo_score: generalSeoScore,
    score_breakdown: scoreBreakdown,
  }
}

export async function getMetaAnalysis(companyId: number) {
  const posts = await prisma.blogPost.findMany({
    where: { companyId },
    select: { id: true, meta_description: true, seo_title: true, focus_keyword: true },
  })

  const oversizedSeoTitles: Array<{ post_id: number; title: string; focus_keyword: string; extra_chars: number }> = []
  const oversizedMetaDescriptions: Array<{ post_id: number; meta_description: string; focus_keyword: string; extra_chars: number }> = []

  let totalMetaLength = 0
  let totalSeoLength = 0
  let metaCount = 0
  let seoCount = 0
  let metaWords = 0
  let seoWords = 0
  let metaKeywordHits = 0
  let seoKeywordHits = 0

  for (const post of posts) {
    const focusKeyword = (post.focus_keyword ?? '').trim()

    const meta = (post.meta_description ?? '').trim()
    if (meta) {
      const len = meta.length
      totalMetaLength += len
      metaCount += 1
      metaWords += countWords(meta)
      metaKeywordHits += countKeywordOccurrences(meta, focusKeyword)
      if (len > 160) {
        oversizedMetaDescriptions.push({
          post_id: post.id,
          meta_description: meta,
          focus_keyword: focusKeyword,
          extra_chars: len - 160,
        })
      }
    }

    const seo = (post.seo_title ?? '').trim()
    if (seo) {
      const len = seo.length
      totalSeoLength += len
      seoCount += 1
      seoWords += countWords(seo)
      seoKeywordHits += countKeywordOccurrences(seo, focusKeyword)
      if (len > 60) {
        oversizedSeoTitles.push({
          post_id: post.id,
          title: seo,
          focus_keyword: focusKeyword,
          extra_chars: len - 60,
        })
      }
    }
  }

  return {
    avg_meta_description_length: round(metaCount ? totalMetaLength / metaCount : 0, 2),
    avg_seo_title_length: round(seoCount ? totalSeoLength / seoCount : 0, 2),
    focus_keyword_density_meta: round(metaWords ? (metaKeywordHits / metaWords) * 100 : 0, 2),
    focus_keyword_density_seo_title: round(seoWords ? (seoKeywordHits / seoWords) * 100 : 0, 2),
    oversized_seo_titles: oversizedSeoTitles,
    oversized_meta_descriptions: oversizedMetaDescriptions,
  }
}

export async function getElementCounts(companyId: number) {
  const [grouped, posts] = await Promise.all([
    prisma.blogPostElement.groupBy({
      by: ['element_type'],
      where: { blog_post: { companyId } },
      _count: { _all: true },
    }),
    prisma.blogPost.findMany({
      where: { companyId },
      select: { id: true, _count: { select: { elements: true } } },
      orderBy: { id: 'asc' },
    }),
  ])

  const elementCounts: Record<string, number> = {}
  for (const entry of grouped) {
    elementCounts[entry.element_type.toLowerCase()] = entry._count._all
  }

  return {
    total_posts: posts.length,
    element_counts: elementCounts,
    total_elements_per_post: posts.map((p) => p._count.elements),
  }
}

export async function getDictionaryAnalytics(companyId: number, includeAllWordsLinks = false) {
  const [words, definitionsCount, hyperlinks] = await Promise.all([
    prisma.word.findMany({
      where: { dictionary: { companyId } },
      select: { keyword: true, letter: true, priority: true },
    }),
    prisma.dictionaryDefinition.count({ where: { word: { dictionary: { companyId } } } }),
    prisma.elementHyperlink.findMany({
      where: { blog_post_element: { blog_post: { companyId } } },
      select: { matched_keywords: true },
    }),
  ])

  const linkCounts = new Map<string, number>()
  let totalHyperlinks = 0

  for (const hyperlink of hyperlinks) {
    for (const keyword of iterateMatchedKeywords(hyperlink.matched_keywords)) {
      const normalized = keyword.toLowerCase()
      if (!normalized) continue
      linkCounts.set(normalized, (linkCounts.get(normalized) ?? 0) + 1)
      totalHyperlinks += 1
    }
  }

  const wordsPerLetter: Record<string, number> = {}
  let highPriorityWords = 0
  let lowPriorityWords = 0

  const allWordsLinkCount = words.map((word) => {
    const firstLetter = (word.letter || word.keyword?.[0] || '#').toUpperCase()
    wordsPerLetter[firstLetter] = (wordsPerLetter[firstLetter] ?? 0) + 1

    if (word.priority === 'HIGH') highPriorityWords += 1
    if (word.priority === 'LOW') lowPriorityWords += 1

    const linkCount = linkCounts.get((word.keyword ?? '').trim().toLowerCase()) ?? 0
    return {
      word: word.keyword,
      link_count: linkCount,
    }
  })

  allWordsLinkCount.sort((a, b) => b.link_count - a.link_count || a.word.localeCompare(b.word))

  const isolatedWords = allWordsLinkCount.filter((item) => item.link_count === 0).map((item) => item.word)

  const response: Record<string, unknown> = {
    total_words: words.length,
    total_definitions: definitionsCount,
    total_hyperlinks: totalHyperlinks,
    most_linked_words: allWordsLinkCount.filter((item) => item.link_count > 0).slice(0, 10),
    isolated_words_count: isolatedWords.length,
    isolated_words: isolatedWords,
    words_per_letter: wordsPerLetter,
    high_priority_words: highPriorityWords,
    low_priority_words: lowPriorityWords,
  }

  if (includeAllWordsLinks) {
    response.all_words_link_count = allWordsLinkCount
  }

  return response
}
