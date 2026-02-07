export type KeywordWord = { keyword: string; description: string };

export function findMatchedKeywords(text: string, words: KeywordWord[]) {
  const matchedKeywords: Array<{ keyword: string; description: string; matched_positions: number[] }> = [];
  const wordsList = (text.toLowerCase().match(/\b\w+\b/g) ?? []);

  for (const word of words) {
    const matchedPositions = wordsList
      .map((w, idx) => ({ w, pos: idx + 1 }))
      .filter((item) => item.w === word.keyword.toLowerCase())
      .map((item) => item.pos);

    if (matchedPositions.length) {
      matchedKeywords.push({
        keyword: word.keyword,
        description: word.description,
        matched_positions: matchedPositions,
      });
    }
  }

  return matchedKeywords;
}

function processSimpleTextElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.text === 'string') matchedKeywords.text = findMatchedKeywords(content.text, words);
  return matchedKeywords;
}

function processTitleAndTextElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.title === 'string') matchedKeywords.title = findMatchedKeywords(content.title, words);
  if (typeof content.text === 'string') matchedKeywords.text = findMatchedKeywords(content.text, words);
  return matchedKeywords;
}

function processListElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.title === 'string') matchedKeywords.title = findMatchedKeywords(content.title, words);
  if (typeof content.text_before_list === 'string') matchedKeywords.text_before_list = findMatchedKeywords(content.text_before_list, words);
  if (Array.isArray(content.list_items)) matchedKeywords.list_items = content.list_items.map((item) => findMatchedKeywords(String(item), words));
  if (typeof content.text_after_list === 'string') matchedKeywords.text_after_list = findMatchedKeywords(content.text_after_list, words);
  return matchedKeywords;
}

function processFaqElement(content: Array<{ question: string; answer: string }>, words: KeywordWord[]) {
  return content.map((qa) => ({
    question: findMatchedKeywords(qa.question, words),
    answer: findMatchedKeywords(qa.answer, words),
  }));
}

function processQuoteElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.quote === 'string') matchedKeywords.quote = findMatchedKeywords(content.quote, words);
  if (typeof content.person === 'string') matchedKeywords.person = findMatchedKeywords(content.person, words);
  if (typeof content.description === 'string') matchedKeywords.description = findMatchedKeywords(content.description, words);
  return matchedKeywords;
}

function processVersusElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.title === 'string') matchedKeywords.title = findMatchedKeywords(content.title, words);
  if (Array.isArray(content.competitors)) matchedKeywords.competitors = content.competitors.map((c) => findMatchedKeywords(String(c), words));
  if (Array.isArray(content.criteria)) {
    matchedKeywords.criteria = content.criteria.map((criterion) => {
      const c = criterion as { name?: string; details?: unknown[] };
      return {
        name: findMatchedKeywords(String(c.name ?? ''), words),
        details: Array.isArray(c.details) ? c.details.map((d) => findMatchedKeywords(String(d), words)) : [],
      };
    });
  }
  return matchedKeywords;
}

function processTableElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.title === 'string') matchedKeywords.title = findMatchedKeywords(content.title, words);
  if (typeof content.text_before === 'string') matchedKeywords.text_before = findMatchedKeywords(content.text_before, words);
  if (Array.isArray(content.headers)) matchedKeywords.headers = content.headers.map((h) => findMatchedKeywords(String(h), words));
  if (Array.isArray(content.rows)) {
    matchedKeywords.rows = content.rows.map((row) =>
      Array.isArray(row) ? row.map((cell) => findMatchedKeywords(String(cell), words)) : [],
    );
  }
  if (typeof content.text_after === 'string') matchedKeywords.text_after = findMatchedKeywords(content.text_after, words);
  return matchedKeywords;
}

function processProsAndConsElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.title === 'string') matchedKeywords.title = findMatchedKeywords(content.title, words);
  if (typeof content.text_before === 'string') matchedKeywords.text_before = findMatchedKeywords(content.text_before, words);
  if (Array.isArray(content.pros)) matchedKeywords.pros = content.pros.map((p) => findMatchedKeywords(String(p), words));
  if (Array.isArray(content.cons)) matchedKeywords.cons = content.cons.map((c) => findMatchedKeywords(String(c), words));
  if (typeof content.text_after === 'string') matchedKeywords.text_after = findMatchedKeywords(content.text_after, words);
  return matchedKeywords;
}

function processCaseStudyElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  for (const key of ['title', 'clientName', 'industry', 'challenge', 'solution']) {
    const value = content[key];
    if (typeof value === 'string') matchedKeywords[key] = findMatchedKeywords(value, words);
  }
  if (Array.isArray(content.results)) matchedKeywords.results = content.results.map((r) => findMatchedKeywords(String(r), words));
  if (content.testimonial && typeof content.testimonial === 'object') {
    const t = content.testimonial as { quote?: string; author?: string };
    matchedKeywords.testimonial = {
      quote: findMatchedKeywords(String(t.quote ?? ''), words),
      author: findMatchedKeywords(String(t.author ?? ''), words),
    };
  }
  return matchedKeywords;
}

function processStatisticElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  if (typeof content.title === 'string') matchedKeywords.title = findMatchedKeywords(content.title, words);
  if (typeof content.description === 'string') matchedKeywords.description = findMatchedKeywords(content.description, words);
  return matchedKeywords;
}

function processToolRecommendationElement(content: Record<string, unknown>, words: KeywordWord[]) {
  const matchedKeywords: Record<string, unknown> = {};
  for (const key of ['title', 'pricing', 'productDescription']) {
    const value = content[key];
    if (typeof value === 'string') matchedKeywords[key] = findMatchedKeywords(value, words);
  }
  if (Array.isArray(content.features)) matchedKeywords.features = content.features.map((f) => findMatchedKeywords(String(f), words));
  return matchedKeywords;
}

export const ELEMENT_PROCESSING_MAP = {
  introduction: processSimpleTextElement,
  conclusion: processSimpleTextElement,
  paragraph: processTitleAndTextElement,
  featured_snippet_block: processTitleAndTextElement,
  list_paragraph: processListElement,
  numbered_list_paragraph: processListElement,
  list_featured_snippet_block: processListElement,
  faq: processFaqElement,
  quote: processQuoteElement,
  versus: processVersusElement,
  table: processTableElement,
  pros_and_cons: processProsAndConsElement,
  case_study: processCaseStudyElement,
  statistic: processStatisticElement,
  tool_recommendation: processToolRecommendationElement,
} as const;
