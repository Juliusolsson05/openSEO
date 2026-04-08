---
name: writing-posts
description: How to write blog content using the structured element system. Use when creating a new blog post, adding content to a post, or asking how to structure post content. Covers research, content quality, element selection, and publishing.
---

# Writing Blog Posts

## The two rules

**1. Be useful.** Most AI content restates what the reader already knows. That is not content — it is noise. Every paragraph must teach something, surprise the reader, or solve a problem. If a sentence exists just to fill space, delete it.

**2. Write for retention.** The reader should *want* to keep reading. Not because you tricked them with a cliffhanger, but because every section earns their attention. If you wouldn't read it yourself, don't publish it.

These two rules override everything else in this skill. When in doubt, cut the fluff and add something specific.

## The pipeline

Follow this order every time. Do not skip the research step.

### Step 1: Research first

Before writing a single word, use web search to find material worth including:

- **Data and statistics** — real numbers make content credible. "Conversion rates improved by 62%" beats "conversion rates improved significantly."
- **Counterintuitive findings** — the stuff that makes people stop scrolling. If conventional wisdom says X but the data says Y, lead with that.
- **Expert perspectives** — quotes, frameworks, or findings from people who actually do this work.
- **Recent developments** — what changed in the last 6–12 months that the reader might not know about.

The goal is to find 3–5 genuinely interesting things to anchor the post around. Not filler. Not "according to a study." Specific, surprising, useful material.

If web search is not available, ask the user for source material, data, or specific experiences to build the post around. Do not write from pure generalities.

### Step 2: Define the metadata

```json
{
  "title_text": "How to Improve Conversion Rate in 7 Steps",
  "slug": "how-to-improve-conversion-rate",
  "seo_title": "How to Improve Conversion Rate in 7 Steps | Your Brand",
  "focus_keyword": "conversion rate optimization",
  "excerpt": "A practical guide to improving conversion performance — from quick wins to structural changes.",
  "meta_description": "Learn 7 practical steps to improve your conversion rate. Covers funnel audits, A/B testing, page speed, and more.",
  "status": "DRAFT",
  "categories": ["SEO", "Analytics"]
}
```

**Guidelines:**
- `title_text`: Clear, specific, compelling. Include the primary keyword naturally.
- `slug`: Lowercase, hyphenated, 4–7 words.
- `seo_title`: Optimized for search results. Under 60 characters.
- `meta_description`: 140–160 characters. Summarize what the reader will learn.
- `excerpt`: 1–2 sentences for the listing page.
- `categories`: 1–3 relevant categories.

### Step 3: Plan the elements

Before writing, outline which element types you'll use and in what order.

**Use a wide range of elements.** Visual content — tables, charts, checklists, comparisons — beats walls of text every time. But the article still needs substance. Multiple paragraphs with real depth are essential. A post that's all visual gimmicks with no written substance is just as bad as a post that's all text.

**A good post balances both:** strong written sections that explain and argue, broken up by visual elements that summarize, compare, or highlight.

| Content need | Element type |
|-------------|-------------|
| Opening the post | `introduction` |
| Explaining a concept | `paragraph` |
| Listing options/benefits/features | `list_paragraph` |
| Step-by-step instructions | `numbered_list_paragraph` |
| Key stat or metric to highlight | `statistic` |
| Important takeaway or answer | `featured_snippet_block` |
| Comparing two options | `versus` |
| Weighing trade-offs | `pros_and_cons` |
| Data in rows and columns | `table` |
| Answering common questions | `faq` |
| Showing a process over time | `timeline` |
| Visualizing numeric data | `bar_chart` |
| Client success story | `case_study` |
| Actionable to-do items | `checklist` |
| Defining terms | `glossary` |
| Expert or notable quote | `quote` |
| Showing an image | `image` |
| Recommending a product/tool | `tool_recommendation` or `product_recommendations` |
| Showing code | `code_cluster` |
| Driving an action | `call_to_action` |
| Closing the post | `conclusion` |

### Step 4: Write the elements

Write each element as a JSON object with `order`, `element_type`, and `content`. Refer to the `element-shapes` skill for the exact content shape of each type.

```json
{
  "elements": [
    {
      "order": 1,
      "element_type": "introduction",
      "content": {
        "text": "..."
      }
    },
    {
      "order": 2,
      "element_type": "paragraph",
      "content": {
        "title": "...",
        "text": "..."
      }
    }
  ]
}
```

A typical post has 8–15 elements. Short posts can have fewer, long-form guides can have more.

### Step 5: Save the post

Insert the post metadata and elements into the project's database or write them as JSON files, depending on the project setup.

**Database:** Insert into the `posts` table and each element into the `elements` table.

**JSON files:** Save to `content/posts/{slug}.json` with the full post object and elements array.

## How to write well

### Write like you're talking to a smart friend

Use contractions. Simple words first. Short paragraphs — 3–5 lines most of the time. Occasional sentence fragments for emphasis. The reader is smart; don't explain things they already know.

Good: "This stuff actually works. Here's why."
Bad: "In today's rapidly evolving digital landscape, it is essential to understand..."

### Be specific, not general

Every claim needs a concrete example, a number, or a real-world reference.

Good: "A 2024 study by Google found that reducing form fields from 11 to 4 increased completion rates by 160%."
Good: "Companies using progressive disclosure in onboarding flows report 25–40% higher activation rates."
Bad: "This can significantly improve outcomes."

If you don't have a specific number or example, find one through research or ask the user. Vague writing is lazy writing.

### Vary your rhythm

Alternate short punchy sentences with longer explanatory ones. Break the pattern on purpose. If every sentence is the same length, it reads like a robot.

Mix a five-word sentence. Then follow it with something that takes its time to unpack an idea, adds a qualifier, and lands on a point the reader didn't expect.

### Add genuine perspective

Light opinions are good. Mild skepticism is good. "Here's the part that surprised me" is good. Don't be a neutral encyclopedia — have a point of view.

But keep it honest. If you're not sure about something, say so.

### Never fake human experience

Do not write from a fabricated first-person perspective. Never say "We conducted a case study at our company" or "In my 15 years of experience" or "When I worked with a client last year." The reader is not stupid — they know an AI wrote this, and fake human stories destroy trust instantly.

Instead:
- Reference real published research, data, or expert quotes found during the research step
- Use "companies that do X tend to see Y" instead of "we did X and saw Y"
- Present analysis and recommendations directly without pretending to have lived them

### Cut ruthlessly

After writing, go back and cut 20–30% of the words. Most first drafts are bloated. Every paragraph must advance the point or add value. If it doesn't, it goes.

Ask: "Would I keep reading here, or would I skim past this?" If you'd skim it, rewrite it or delete it.

## Banned patterns

These make content feel like generic AI slop. Avoid them completely:

**Words to never use:** "delve," "tapestry," "realm," "vibrant," "landscape" (figurative), "intricate," "pivotal," "underscore," "navigate" (figurative), "embark," "testament," "synergy," "nuanced," "comprehensive," "robust," "transformative," "harness," "illuminate," "resonate," "moreover," "furthermore," "it's worth noting."

**Phrases to never use:** "In today's rapidly evolving world," "Not only… but also," "It's not just X — it's Y," "A testament to," "Shed light on," "Deep dive," "Plays a crucial role in."

**Structural patterns to avoid:**
- Cookie-cutter openings that restate the title as a question
- Summary conclusions that just repeat what was already said
- Perfect symmetry — three points with three sub-points each
- Every sentence starting the same way
- Em dashes more than twice per 500 words
- Hedging everywhere ("It could be argued that...")
- Vague platitudes or "this represents a broader shift"
- Repeating the same idea in different words across paragraphs

## Element-specific tips

### Introduction
Lead with the strongest, most interesting thing from your research. Not a vague setup paragraph. The reader decides in 5 seconds whether to keep reading.

### Paragraphs
These are the backbone. Write them with depth. A paragraph element should actually *explain* something, not just state it. Use the `title` field for clear section headings.

### Featured snippet
One per post, maximum. Use it for the single most important takeaway — the thing someone would highlight and share.

### FAQ
Write questions from the reader's perspective: "How long should I run an A/B test?" not "A/B test duration." Keep answers to 2–4 sentences. 3–7 items is the sweet spot.

### Call to action
One per post, near the end. More than one dilutes impact.

### Visual elements (tables, charts, versus, pros/cons)
These break up text and make information scannable. Use them where they genuinely help — not as decoration. A comparison that only has one criterion is pointless. A table with two rows should just be a sentence.

## Publishing

Set `status` to `PUBLISHED` and `published_at` to the current timestamp. For scheduled publishing, set `published_at` to a future date.
