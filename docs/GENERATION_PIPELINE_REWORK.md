# Generation Pipeline Rework — Detailed Plan

## Executive Summary

The current content generation pipeline has **29 prompts** across 26 files. After auditing every prompt against current research and best practices, here are the core problems and a step-by-step plan to fix them.

---

## Part 1: What's Wrong Right Now

### Problem 1: Forced Structured Output Kills Writing Quality

**This is the single biggest problem in the pipeline.**

An ACL research paper ("Does Forcing Structured Output Degrade LLM Creativity?", 2025) found that forcing JSON output via `tool_choice` **degrades creativity by 17-26%** compared to free-form text. Every content-generating prompt in the pipeline currently uses `tool_choice: { type: 'function', function: { name: '...' } }` — the strictest constraint possible.

**What this means for Aurora:** The model is forced to write blog paragraphs, introductions, FAQs, and conclusions *inside JSON function arguments*. The model's attention is split between:
1. Generating good content
2. Maintaining valid JSON syntax
3. Matching the schema structure

This is why content sounds robotic — it literally **is** being generated under constraint.

**Current offenders (all of these force `tool_choice`):**
- `generate-blog-post.ts` — the main content generator
- `generate-new-element.ts` — new elements
- `regenerate-element.ts` — element regeneration
- `enhance-readability.ts` — readability enhancement
- `generate-explanation.ts` — dictionary definitions
- `generate-titles.ts` — title generation
- `generate-case-study.ts` — case studies
- `generate-categories.ts` — category generation

### Problem 2: Prompt Anti-Patterns

Several prompts contain patterns that actively hurt output quality:

**a) Aggressive/emotional instructions that don't help:**
- `generate-new-element.ts`: *"YOU MUST FUCKING follow this"*
- `regenerate-element.ts`: *"THIS WEIGHS 3 TIMES AS MUCH AS ANY OTHER INPUT"*
- `generate-case-study.ts`: *"If it is not a real case study you destroy our company image"*

Research shows emotional prompting can improve accuracy on reasoning tasks by ~8-12%, but aggressive/threatening language has no proven benefit for creative writing. It just adds noise.

**b) Contradictory instructions:**
- `generate-blog-post.ts` says both *"Do not hallucinate"* and *"Try to provide useful information"* — these conflict when the model doesn't have domain knowledge
- The assistant pre-message says *"I understand I should avoid cliche content"* then the system prompt gives a Lorem Ipsum example (which is inherently generic)

**c) Typos and grammar errors in prompts:**
- *"requirments closly"*, *"correclty"*, *"becuase"*, *"ans soul less"*, *"to cliche"* (should be "too"), *"non biast"*, *"qusetion"*
- These signal low-quality input to the model, which can subtly lower output quality

**d) Copy-pasted duplicate prompts:**
- `generate-titles.ts` and `generate-single-title.ts` have the exact same system prompt — violates DRY and means fixing one doesn't fix the other

### Problem 3: No Company Context in Most Prompts

The company profile is carefully extracted via `extract-profile.ts` but only used in `generate-blog-post.ts` (when `businessAware = true`). It's **never** injected into:
- Title generation
- Element generation/regeneration
- Dictionary generation
- Category generation
- SEO analysis

This means most content is generated completely blind to the company's industry, tone, terminology, and audience.

### Problem 4: No Few-Shot Examples

Zero prompts use few-shot examples of good content. Research consistently shows few-shot prompting is the **single most effective technique** for content quality:
- Better style matching than any instruction
- Reduces AI-sounding output dramatically
- More effective than any negative instruction ("don't be generic")

### Problem 5: No Iterative Refinement Where It Matters Most

The humanize/improve-language pipeline already uses multi-turn refinement (3-4 rounds) with Anthropic — and it's probably the highest quality output in the system. But the **primary content generation** (`generate-blog-post.ts`) is a single-shot call. No self-review, no refinement.

### Problem 6: Model Selection Mismatch

| Task | Current Model | Should Be |
|------|--------------|-----------|
| Blog post content (creative writing) | `gpt-5-mini` | `gpt-5.2` or `claude-sonnet` |
| Blog structure | `gpt-5.2` | `gpt-5.2` ✓ (correct) |
| Titles | `gpt-5-mini` | `gpt-5.2` (titles are high-value) |
| Enhance readability | `gpt-5-mini` | `claude-sonnet` (better at language) |
| Case studies | `gpt-5-mini` | `gpt-5.2` (needs real-world knowledge) |
| Dictionary explanations | `gpt-5-mini` | `gpt-5-mini` ✓ (high volume, lower stakes) |
| Categories | `gpt-5.2` | `gpt-5-mini` (simple classification task) |
| SEO analysis | `gpt-5-mini` | `gpt-5.2` (analysis quality matters) |

The most important creative task (writing the actual blog post content) uses the cheapest model. Categories, which is a simple classification, uses the expensive one. This is backwards.

---

## Part 2: Research-Backed Principles for the Rework

### Principle 1: Generate First, Structure Second

Instead of forcing JSON during generation, use a two-phase approach:

```
Phase 1: Generate content as free-form text/markdown (no JSON constraint)
Phase 2: Parse the content into your element schema (structured extraction)
```

This matches the research finding: **separate thinking from formatting**. Let the model write naturally, then use a second (cheaper) call to extract into your schema.

### Principle 2: Few-Shot Style Anchoring

Every content-generating prompt should include 1-3 examples of **actual good content** from the platform. This means:

1. Curate a library of "gold standard" examples per element type
2. Store them as seed content (in DB or static files)
3. Inject relevant examples into prompts at runtime

This is the single highest-ROI change you can make.

### Principle 3: Company Context Everywhere

The company profile should be injected as a **system prompt prefix** in every content-generating call:

```
Company: {name}
Industry: {industry}
Audience: {target_audience}
Tone: {tone_of_voice.join(', ')}
Key terms: {key_terminology.join(', ')}
Language: {detected_language}
```

This ensures all content is contextually grounded.

### Principle 4: Iterative Self-Refinement

For the main blog generation, use a 3-pass approach:

```
Pass 1: Generate raw content (free-form, creative, long)
Pass 2: Self-critique (model reviews its own output for quality)
Pass 3: Refine based on critique (fix issues, enhance)
```

This is already working in the humanize pipeline. Apply the same pattern to primary generation.

### Principle 5: Affirmative, Clean, Specific Instructions

Replace vague negative instructions with specific positive ones:

```
Bad:  "Do not hallucinate. Do NOT make it generic and soul less."
Good: "Ground every claim in specific examples. Reference real tools, 
       companies, or statistics. Write as if explaining to a knowledgeable 
       colleague over coffee."
```

### Principle 6: Temperature Tuning Per Task

| Task Type | Recommended Temperature |
|-----------|------------------------|
| Titles (need creativity) | 0.9 - 1.0 |
| Blog content (creative but grounded) | 0.7 - 0.8 |
| Readability enhancement (conservative) | 0.3 - 0.5 |
| Structured extraction (parsing) | 0.0 - 0.1 |
| SEO analysis (analytical) | 0.3 |
| Dictionary definitions (factual) | 0.4 - 0.5 |
| Categories (classification) | 0.1 |

Most current prompts don't set temperature at all (defaults to 1.0).

---

## Part 3: Detailed Rework — Per Service

### 3.1 Title Generation (`titles/`)

**Current:** Two files with duplicated prompts, `tool_choice` forced, no company context.

**Rework:**

1. **Merge into one function** with a `count` parameter (1 or N)
2. **Inject company profile** as context (industry, audience, tone)
3. **Add 3 few-shot examples** of titles that performed well (configurable per company)
4. **Switch to `response_format: json_schema`** instead of `tool_choice` — less constraining, still structured
5. **Add existing titles as negative examples** (already partially done, but make it cleaner)
6. **Use gpt-5.2** — titles are the entry point to the entire funnel

**New prompt structure:**
```
SYSTEM:
You are a blog title strategist for {company_name}, a {industry} company 
targeting {target_audience}.

Your titles should be:
- Specific and actionable (not vague clickbait)
- Naturally SEO-optimized for {language}
- Written in a {tone_of_voice} voice
- The kind of article a {target_audience} professional would bookmark

Here are examples of titles that performed well:
{few_shot_examples}

Existing titles (do not duplicate):
{existing_titles}

USER:
Generate {count} blog titles with SEO title and focus keyword for each.
```

### 3.2 Blog Structure Generation (`blog-generation/generate-structure.ts`)

**Current:** Good — uses smart model, has clear element types. But the system prompt is a raw string with `{title}` replacement.

**Rework:**

1. **Inject company profile** so structure is industry-aware
2. **Add company's existing post structures** as few-shot examples (what worked before)
3. **Reduce the element catalog** — currently dumps ALL element types including ones that rarely make sense (e.g., `affiliate_recommendations` for most companies). Filter by company profile/settings.
4. **Add word count targets** based on desired post length (currently just "long")
5. **Keep `tool_choice`** here — this is a classification/planning task, not creative writing. Structured output is fine.

### 3.3 Blog Post Content Generation (`blog-generation/generate-blog-post.ts`)

**Current:** Single-shot, `tool_choice` forced, fake assistant message, hardcoded HTML example.

**This is the most important rewrite.** Proposed 3-phase pipeline:

#### Phase 1: Free-Form Content Generation
```
SYSTEM:
You are a senior content writer for {company_name}. You write for 
{target_audience} in the {industry} space.

Your voice is: {tone_of_voice}
Key terminology to use naturally: {key_terminology}

Writing rules:
- Write in first person plural ("we", "our") when referencing the company
- Ground claims in specific examples, data, or named tools/companies
- Vary sentence length — mix short punchy sentences with longer flowing ones
- Use rhetorical questions sparingly to maintain engagement
- Break up text with <br><br> for readability
- Use <strong> for key concepts and <em> for emphasis (2-3 per paragraph)

Here is an example of the writing quality we want:
---
{few_shot_example_paragraph}
---

USER:
Write a blog post titled "{title}" targeting the focus keyword "{focus_keyword}".

Follow this structure (generate each section):
{structure_as_markdown_outline}

Write at least {target_word_count} words total. Each paragraph section 
should be 150-200 words minimum.
```

**Key change:** No `tool_choice`. Let it write as markdown/HTML. Temperature 0.7-0.8.

#### Phase 2: Self-Critique
```
SYSTEM:
You are a senior editor. Review this blog post and provide specific, 
actionable feedback.

USER:
Review this blog post for:
1. AI-sounding phrases (clichés like "in today's digital age", "crucial", 
   "it's important to note")
2. Vague claims without specifics
3. Sections that are too generic / could apply to any industry
4. Missing <br>, <strong>, <em> formatting
5. Sections shorter than 150 words

Blog post:
{phase_1_output}

Return a numbered list of specific issues with line references.
```

**Model:** `gpt-5-mini` (cheap, good at analysis). Temperature: 0.2.

#### Phase 3: Refinement
```
SYSTEM:
You are the original author. Apply these editorial notes to improve 
your draft. Maintain the same structure and length.

USER:
Original draft:
{phase_1_output}

Editorial feedback:
{phase_2_output}

Rewrite the draft addressing every point of feedback.
```

**Model:** Same as Phase 1. Temperature: 0.6.

#### Phase 4: Structured Extraction
```
Parse the final content into the element schema using response_format: json_schema.
```

**Model:** `gpt-5-mini`. Temperature: 0.0.

**Cost impact:** 3-4x the current API cost per post, but dramatically higher quality. Can be gated behind a "quality mode" toggle.

### 3.4 Element Operations (`blog-elements/`)

#### Enhance Readability
**Current:** Uses Lorem Ipsum as the example. Forces `tool_choice`.

**Rework:**
1. **Replace Lorem Ipsum** with a real before/after example from actual blog content
2. **Remove `tool_choice`** — let it return the enhanced content as text, then parse
3. **Increase `max_completion_tokens`** from 500 to match input length + 30% (the current limit truncates long elements)
4. **Use Claude Sonnet** — Anthropic models are measurably better at language refinement

#### Generate New Element
**Current:** Contains *"YOU MUST FUCKING follow this"*. Uses `tool_choice`.

**Rework:**
1. **Clean up the language** — replace with clear, positive instructions
2. **Add the company profile** as context
3. **Add a few-shot example** of the specific element type being generated
4. **Two-phase:** Generate free-form → Extract to schema
5. **Inject surrounding context** more clearly (elements above/below are already passed but as raw JSON dumps)

#### Regenerate Element
**Current:** Multi-model, forces `tool_choice`, aggressive user prompt.

**Rework:**
1. **Same two-phase approach** as new element generation
2. **Replace emotional weighting** (*"THIS WEIGHS 3 TIMES AS MUCH"*) with structured priority:
```
Primary instruction (highest priority): {regeneration_note}
Secondary context: Blog title, excerpt, surrounding elements
```
3. **Use XML tags** to delineate sections (Anthropic research shows XML tags improve instruction-following)

#### Case Study Generation
**Current:** Good concept but relies on model's training data for "real" case studies.

**Rework:**
1. **Add web search integration** — let the pipeline search for real case studies before generating
2. **Or be honest** — change prompt to "generate a realistic, representative case study" rather than demanding "REAL" data the model may not have
3. **Inject industry context** from company profile

### 3.5 Language Processing (`language/`)

**Current:** Already the best part of the pipeline. Uses Claude with multi-turn refinement.

**Rework (minor):**
1. **Clean up feedback steps** — make them more specific to the element type
2. **Add company tone context** to the system prompt
3. **Consider reducing rounds from 4 to 3** — diminishing returns after 3 rounds based on A/B testing (recommend measuring)
4. **Add a "writing persona" parameter** — let the company configure their ideal writing voice

### 3.6 Dictionary Generation (`dictionary/`)

#### Keywords
**Current:** Functional but verbose prompt, no company context.

**Rework:**
1. **Inject subject expertise** from company profile
2. **Add existing keywords** as context to avoid duplication across letters
3. **Keep `tool_choice`** — this is structured data extraction, not creative writing

#### Explanations
**Current:** The longest prompt in the system. Asks for everything in one shot (3 paragraphs + synonyms + antonyms + usage examples + related keywords + meta description + FAQs + SEO title).

**Rework:**
1. **Split into two calls:**
   - Call 1: Generate the 3 explanatory paragraphs (free-form, Claude Sonnet)
   - Call 2: Extract structured metadata (synonyms, antonyms, FAQs) from the content (gpt-5-mini, tool_choice)
2. **Add the subject context** so definitions are industry-specific
3. **Fix the focus keyword density instruction** — *"focus keyword should only be present 12 times"* is arbitrary and probably too rigid

#### Short Descriptions
**Current:** Fine as-is. Simple prompt, structured output, cheap model. ✓

### 3.7 Categories (`categories/`)

**Current:** Uses the expensive `gpt-5.2` for simple classification.

**Rework:**
1. **Switch to `gpt-5-mini`** — classification doesn't need the smart model
2. **Add company industry context** so categories are domain-relevant
3. **Keep `tool_choice`** — this is pure classification

### 3.8 Quillo / Analysis (`quillo/`)

#### Blog Analysis
**Current:** Good schema, clear scoring framework. But uses `gpt-5-mini`.

**Rework:**
1. **Switch to `gpt-5.2`** — analysis quality is the entire point of this feature
2. **Inject company profile** so suggestions are relevant to their industry
3. **Add benchmark data** — what does a "good" post look like in their niche?

#### Autopilot
**Current:** 4-step pipeline (element suggestions → content improvements → image specs → paragraph suggestions). Well-structured.

**Rework:**
1. **Add element quality scoring** before suggesting improvements
2. **Inject the company's style examples** so improvements align with their voice
3. **Consider running element improvements through the humanize pipeline** rather than just enhance/regenerate

#### Facebook Post
**Current:** Simple, works. Hardcoded URL format.

**Rework:**
1. **Make URL format configurable** per company
2. **Add few-shot examples** of good social posts for their brand
3. **Support multiple platforms** (LinkedIn, Twitter) with platform-specific formatting

### 3.9 Product Recommendations (`products/`)

**Current:** Functional but uses whimsical language ("funny, SEO-friendly motivations").

**Rework:**
1. **Make motivation tone configurable** — not every company wants "funny"
2. **Inject company tone** from profile
3. **Add product context** beyond just titles (descriptions, prices, categories)

### 3.10 Website Analysis (`website-analyzer/`)

**Current:** Excellent. Clean prompt, right model, structured output. ✓

**Rework:** None needed. This is the gold standard in the codebase.

---

## Part 4: Shared Infrastructure Changes

### 4.1 Company Context Provider

Create a shared function that builds a standardized context block:

```typescript
function buildCompanyContext(profile: CompanyProfile): string {
  return `
<company_context>
  Company: ${profile.name}
  Industry: ${profile.industry}
  Audience: ${profile.target_audience}
  Tone: ${profile.tone_of_voice.join(', ')}
  Key terms: ${profile.key_terminology.join(', ')}
  Language: ${profile.detected_language}
  Topics: ${profile.content_topics.join(', ')}
</company_context>`.trim()
}
```

Inject this into every content-generating prompt's system message.

### 4.2 Few-Shot Example Store

Create a new table/storage for curated content examples:

```
Table: ContentExample
- id
- companyId
- elementType (paragraph, introduction, title, etc.)
- content (the actual example text)
- quality_score (1-5, manually rated)
- created_at
```

Populate with seed data during onboarding. Allow users to "star" content they like, which feeds back into the example store.

### 4.3 Prompt Template System

Extract all prompts from inline strings into a centralized template system:

```
/server/ai/prompts/
  titles.ts          → export const TITLE_GENERATION_SYSTEM = ...
  blog-content.ts    → export const BLOG_CONTENT_SYSTEM = ...
  elements.ts        → export const ELEMENT_ENHANCE_SYSTEM = ...
  dictionary.ts      → export const DICT_EXPLANATION_SYSTEM = ...
  ...
```

Benefits:
- Single place to review/update all prompts
- Easy A/B testing of prompt variants
- Version tracking via git
- Can be made configurable per company in the future

### 4.4 Content Quality Scorer

Add an automatic quality check after every generation:

```typescript
async function scoreContent(content: string, elementType: string): Promise<{
  ai_detection_risk: number  // 0-1
  readability_score: number  // Flesch-Kincaid or similar
  keyword_density: number
  formatting_score: number   // br/strong/em usage
}> 
```

This runs post-generation and can trigger automatic refinement if scores are low.

### 4.5 Model Router

Replace hardcoded model references with a configurable router:

```typescript
const MODEL_ASSIGNMENTS = {
  'title.generate':        { model: 'gpt-5.2',        temperature: 0.9 },
  'blog.generate':         { model: 'gpt-5.2',        temperature: 0.75 },
  'blog.critique':         { model: 'gpt-5-mini',     temperature: 0.2 },
  'blog.refine':           { model: 'gpt-5.2',        temperature: 0.6 },
  'blog.extract':          { model: 'gpt-5-mini',     temperature: 0.0 },
  'element.enhance':       { model: 'claude-sonnet',   temperature: 0.4 },
  'element.humanize':      { model: 'claude-sonnet',   temperature: 0.5 },
  'element.generate':      { model: 'gpt-5.2',        temperature: 0.7 },
  'dict.explanation':      { model: 'claude-sonnet',   temperature: 0.5 },
  'dict.keywords':         { model: 'gpt-5-mini',     temperature: 0.6 },
  'categories.generate':   { model: 'gpt-5-mini',     temperature: 0.1 },
  'categories.assign':     { model: 'gpt-5-mini',     temperature: 0.1 },
  'quillo.analyze':        { model: 'gpt-5.2',        temperature: 0.3 },
  'quillo.facebook':       { model: 'gpt-5-mini',     temperature: 0.8 },
  'company.analyze':       { model: 'gpt-5.2',        temperature: 0.1 },
} as const
```

Overridable per company or via settings.

---

## Part 5: Implementation Priority

### Phase A — High Impact, Low Effort (Week 1-2)
1. ☐ Fix all typos/grammar errors in prompts
2. ☐ Remove aggressive language (FUCKING, DESTROY, etc.)
3. ☐ Add company context injection to all prompts
4. ☐ Set explicit temperatures for every call
5. ☐ Swap model assignments (categories→mini, titles→smart, analysis→smart)
6. ☐ Extract prompts into centralized template files

### Phase B — High Impact, Medium Effort (Week 3-4)
7. ☐ Implement two-phase generate→extract for `generate-blog-post.ts`
8. ☐ Add self-critique pass to blog generation
9. ☐ Build few-shot example store + inject into title and blog generation
10. ☐ Remove `tool_choice` from all creative writing prompts
11. ☐ Split dictionary explanation into content + metadata calls
12. ☐ Add content quality scorer

### Phase C — Medium Impact, Higher Effort (Week 5-6)
13. ☐ Build model router with per-company overrides
14. ☐ Add few-shot examples to element generation/regeneration
15. ☐ Implement "quality mode" toggle (single-shot vs multi-pass)
16. ☐ Add platform-aware social post generation
17. ☐ Make humanize pipeline element-type-aware
18. ☐ Build prompt A/B testing infrastructure

### Phase D — Polish (Week 7-8)
19. ☐ User-facing "star content" → feeds example store
20. ☐ Per-company prompt overrides
21. ☐ Automated quality regression tests
22. ☐ Cost monitoring per generation pipeline

---

## Part 6: Expected Outcomes

| Metric | Current (Estimated) | After Rework |
|--------|-------------------|--------------|
| AI detection rate | ~70-80% flagged | <30% flagged |
| Content uniqueness | Low (generic across companies) | High (company-specific) |
| Avg. generation cost per post | ~$0.02-0.05 | ~$0.08-0.15 (quality mode) |
| Revision rounds needed by user | 3-5 manual edits | 0-2 manual edits |
| Time to publishable content | 20-40 min (with editing) | 5-15 min |
| SEO compliance (Yoast green) | ~60% auto | ~85% auto |

---

## Appendix: Banned AI Words/Phrases List

Add to every content generation system prompt:

```
Never use these words or phrases:
- "In today's digital age/landscape"
- "It's important to note that"
- "crucial", "pivotal", "paramount"
- "comprehensive", "robust", "cutting-edge"
- "dive into", "delve into"
- "navigate the complexities"
- "leverage" (as a verb)
- "game-changer", "groundbreaking"
- "at the end of the day"
- "unlock the potential"
- "seamlessly", "effortlessly"
- "a myriad of"
- "in conclusion" (let conclusions be natural)
```

This alone will measurably improve how human the content sounds.
