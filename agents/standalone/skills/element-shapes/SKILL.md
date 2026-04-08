---
name: element-shapes
description: Complete reference for all 20+ blog element types and their content shapes. Use when building element components, writing blog post content, or looking up the fields for a specific element type like paragraph, faq, checklist, table, timeline, etc.
user-invocable: false
---

# Element Shapes Reference

Complete reference for all element types in the content system. Each post is composed of ordered elements. Every element has an `element_type` string and a `content` object whose shape depends on the type.

Use this file when building element components or when writing post content.

---

## `introduction`

Opening section of a post.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Heading. Defaults to "Introduction" if absent. |
| `text` | string | yes | Introduction body text. |

```json
{
  "text": "Welcome to our comprehensive guide on effective business strategies. In this guide, you'll learn how to optimize your operations, enhance productivity, and achieve sustainable growth."
}
```

**Hyperlink-capable fields:** `text`

---

## `paragraph`

Standard text block with optional heading. The most common element type.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Section heading. May be absent for body paragraphs. |
| `text` | string | yes | Paragraph body text. May contain light HTML. |

```json
{
  "title": "About Our Company",
  "text": "Our company specializes in providing top-notch digital solutions to help businesses thrive in the modern marketplace."
}
```

**Hyperlink-capable fields:** `title`, `text`

---

## `conclusion`

Closing section of a post.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Heading. Defaults to "Conclusion" if absent. |
| `text` | string | yes | Conclusion body text. |

```json
{
  "title": "Wrapping Up",
  "text": "In conclusion, our strategies have effectively improved the company's performance and set the stage for future growth."
}
```

**Hyperlink-capable fields:** `text`

---

## `list_paragraph`

Bulleted list with optional surrounding text.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Section heading. |
| `text_before_list` | string | no | Introductory paragraph before the list. |
| `list_items` | string[] | yes | Bulleted list items. |
| `text_after_list` | string | no | Closing paragraph after the list. |

```json
{
  "title": "Benefits of Remote Work",
  "text_before_list": "Remote work offers several advantages:",
  "list_items": [
    "Increased flexibility",
    "Reduced commuting time",
    "Improved work-life balance",
    "Access to a broader talent pool"
  ],
  "text_after_list": "These benefits contribute to higher employee satisfaction and productivity."
}
```

**Hyperlink-capable fields:** `title`, `text_before_list`, `list_items`, `text_after_list`

---

## `numbered_list_paragraph`

Ordered list with optional surrounding text.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Section heading. |
| `text_before_list` | string | no | Introductory paragraph. |
| `list_items` | string[] | yes | Numbered list items. |
| `text_after_list` | string | no | Closing paragraph. |

```json
{
  "title": "Steps to Improve SEO",
  "text_before_list": "Follow these steps to enhance your website's SEO:",
  "list_items": [
    "Keyword Research: Identify relevant keywords for your content.",
    "Optimize Content: Incorporate keywords naturally into your content.",
    "Improve Site Speed: Ensure your website loads quickly.",
    "Build Backlinks: Acquire quality backlinks from reputable sites.",
    "Monitor Performance: Use tools to track your SEO progress."
  ],
  "text_after_list": "Implementing these steps will significantly boost your search engine ranking."
}
```

**Hyperlink-capable fields:** `title`, `text_before_list`, `list_items`, `text_after_list`

---

## `image`

Inline image with caption.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | Image URL. Prefix relative paths with your API base URL. |
| `alt` | string | no | Alt text for accessibility. |
| `caption` | string | no | Caption displayed below the image. |
| `description` | string | no | Longer description (SEO/tooltips). |

```json
{
  "url": "https://via.placeholder.com/800x400",
  "alt": "Analytics dashboard",
  "description": "A landscape showcasing the mountains during sunset, symbolizing tranquility and natural beauty."
}
```

**URL resolution:** Absolute URLs use as-is. Paths starting with `/` prefix with API base URL. Bare filenames prefix with `{base_url}/media/`.

---

## `quote`

Attributed quotation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quote` | string | yes | The quote text. |
| `person` | string | yes | Who said it. |
| `description` | string | no | Context about the person (title, company). |

```json
{
  "quote": "The only way to do great work is to love what you do.",
  "person": "Steve Jobs",
  "description": "Co-founder of Apple Inc."
}
```

**Hyperlink-capable fields:** `quote`, `person`, `description`

---

## `featured_snippet_block`

Google snippet-optimized block with concise answer text.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Snippet heading (usually a question). |
| `text` | string | yes | The concise answer text. |

```json
{
  "title": "Key Insight",
  "text": "Investing in SEO can lead to a 30% increase in organic traffic within six months."
}
```

**Hyperlink-capable fields:** `title`, `text`

---

## `faq`

Question/answer pairs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Section heading. Defaults to "FAQ". |
| `items` | Array<{question, answer}> | yes | Each item has `question` (string) and `answer` (string). |

```json
{
  "title": "Frequently Asked Questions",
  "items": [
    {
      "question": "What is the return policy?",
      "answer": "You can return any item within 30 days of purchase for a full refund."
    },
    {
      "question": "Do you offer international shipping?",
      "answer": "Yes, we ship to most countries worldwide."
    }
  ]
}
```

**Hyperlink-capable fields:** `items.question`, `items.answer`

> **Legacy note:** Older content may store FAQs as a bare array instead of `{title, items}`. Normalize by checking `Array.isArray(content)` and wrapping: `{title: "FAQ", items: content}`.

---

## `call_to_action`

CTA block with button and optional image.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | CTA heading. |
| `description` | string | no | CTA body text. |
| `button_label` | string | no | Button text. |
| `button_href` | string | no | Button link URL. |
| `target_url` | string | no | Alias for `button_href` (legacy). |
| `link` | string | no | Alias for `button_href` (legacy). |
| `image_url` | string | no | Optional banner image. |
| `image` | string | no | Alias for `image_url` (legacy). |

```json
{
  "title": "Start your free trial today",
  "description": "Get started in minutes with no credit card required.",
  "button_label": "Sign Up Free",
  "button_href": "https://example.com/signup",
  "image_url": "/images/cta-banner.png"
}
```

> **Legacy note:** Prefer `button_href` and `image_url`. Fall back to `target_url ?? link` and `image_url ?? image` for older content.

---

## `glossary`

Term/definition list.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Glossary heading. |
| `items` | Array<{term, definition}> | yes | Term/definition pairs. |

```json
{
  "title": "Glossary",
  "terms": {
    "Search Intent": "The primary goal a user has when entering a query into a search engine.",
    "Backlink": "A hyperlink from one website to another, often used as a ranking signal in SEO.",
    "Meta Description": "A short summary of a page used in search snippets to describe content."
  }
}
```

> **Note:** The `terms` field may be an object (key-value) or an array of `{term, definition}`. Handle both formats.

---

## `versus`

Side-by-side comparison with criteria.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Comparison heading. |
| `text_before` | string | no | Intro text. |
| `competitors` | string[] | yes | Names of the options being compared. |
| `criteria` | Array<{name, winner, details[]}> | yes | Each criterion: `name` (string), `winner` (number — index into competitors), `details` (string[] — one per competitor). |
| `text_after` | string | no | Closing text. |

```json
{
  "title": "Tool A vs Tool B",
  "text_before": "Comparing two leading tools:",
  "competitors": ["Tool A", "Tool B"],
  "criteria": [
    {
      "name": "Ease of Use",
      "winner": 0,
      "details": [
        "Tool A is more intuitive and user-friendly.",
        "Tool B has a steeper learning curve."
      ]
    },
    {
      "name": "Features",
      "winner": 1,
      "details": [
        "Tool A offers basic features.",
        "Tool B provides advanced functionalities."
      ]
    }
  ],
  "text_after": "Choose the one that best fits your needs."
}
```

**Hyperlink-capable fields:** `title`, `text_before`, `competitors`, `criteria.name`, `criteria.details`, `text_after`

---

## `table`

Data table with headers and rows.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Table heading. |
| `text_before` | string | no | Paragraph before the table. |
| `headers` | string[] | yes | Column header labels. |
| `rows` | string[][] | yes | 2D array of cell values. Each inner array is one row. |
| `text_after` | string | no | Paragraph after the table. |

```json
{
  "title": "Sales Data Q1 2024",
  "text_before": "The following table summarizes our sales performance:",
  "headers": ["Product", "Units Sold", "Revenue"],
  "rows": [
    ["Widget A", "500", "$50,000"],
    ["Widget B", "300", "$30,000"],
    ["Widget C", "200", "$20,000"]
  ],
  "text_after": "Sales have shown a steady increase compared to the previous quarter."
}
```

**Hyperlink-capable fields:** `title`, `text_before`, `headers`, `rows`, `text_after`

---

## `pros_and_cons`

Two-column pro/con comparison.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Section heading. |
| `text_before` | string | no | Intro text. |
| `pros` | string[] | yes | List of advantages. |
| `cons` | string[] | yes | List of disadvantages. |
| `text_after` | string | no | Closing text. |

```json
{
  "title": "Pros and Cons of Remote Work",
  "text_before": "Here are some advantages and disadvantages:",
  "pros": [
    "Flexibility in work hours",
    "No commute time",
    "Better work-life balance"
  ],
  "cons": [
    "Potential for isolation",
    "Difficulty in separating work from personal life",
    "Challenges in communication"
  ],
  "text_after": "Overall, remote work offers significant benefits but presents challenges."
}
```

**Hyperlink-capable fields:** `title`, `text_before`, `pros`, `cons`, `text_after`

---

## `case_study`

Client success story with challenge/solution/results.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Case study title. |
| `clientName` | string | no | Client or company name. |
| `industry` | string | no | Industry vertical. |
| `companyWebsite` | string | no | Client website URL. |
| `headerColor` | string | no | Hex color for the header. |
| `challenge` | string | no | The problem that was solved. |
| `solution` | string | no | How it was solved. |
| `results` | string[] | no | Key outcome bullet points. |
| `testimonial` | {quote, author} | no | Optional client quote. |

```json
{
  "title": "Transforming Business Processes",
  "clientName": "Acme Corp",
  "industry": "Manufacturing",
  "headerColor": "#FF5733",
  "challenge": "Outdated processes hindering productivity and scalability.",
  "solution": "Implemented a comprehensive ERP system to streamline operations.",
  "results": [
    "Increased productivity by 30%",
    "Reduced operational costs by 20%",
    "Enhanced data visibility across departments"
  ],
  "testimonial": {
    "quote": "The ERP implementation has revolutionized our operations.",
    "author": "Jane Doe, CEO of Acme Corp"
  }
}
```

**Hyperlink-capable fields:** `title`, `clientName`, `industry`, `challenge`, `solution`, `results`

---

## `checklist`

Actionable checklist with optional details per item.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Checklist heading. |
| `introduction` | string | no | Intro paragraph. |
| `items` | Array<{action, details?, checked?}> | yes | Each item: `action` (string, required), `details` (string, optional), `checked` (boolean, default false). |
| `conclusion` | string | no | Closing paragraph. |

```json
{
  "title": "Pre-launch SEO checklist",
  "introduction": "Use this checklist before publishing to improve discoverability.",
  "items": [
    {
      "action": "Define one primary keyword",
      "details": "Keep it aligned with search intent.",
      "checked": true
    },
    {
      "action": "Write a clear meta description",
      "details": "Aim for 140-160 characters.",
      "checked": false
    }
  ],
  "conclusion": "Once everything is checked, publish and monitor CTR."
}
```

**Hyperlink-capable fields:** `title`, `introduction`, `items.action`, `items.details`, `conclusion`

---

## `statistic`

Highlighted metric with label and description.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Context heading. |
| `value` | string | yes | The stat value (e.g. "47%", "3.2x"). |
| `label` | string | no | Short label for the stat. |
| `description` | string | no | Longer explanation. |

```json
{
  "title": "Customer Satisfaction",
  "value": "85%",
  "label": "Satisfaction Rate",
  "description": "Our customer satisfaction rate has reached an all-time high this quarter."
}
```

> **Note:** Older content may use `percentage` (number) instead of `value` (string). Normalize: `String(content.value ?? content.percentage ?? '')`.

**Hyperlink-capable fields:** `title`, `description`

---

## `timeline`

Chronological events.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Timeline heading. |
| `text_before` | string | no | Intro text. |
| `events` | Array<{date?, title, description}> | yes | Chronological entries. |
| `text_after` | string | no | Closing text. |

```json
{
  "title": "Company Growth Timeline",
  "text_before": "Key milestones in our journey:",
  "events": [
    {
      "date": "January 2024",
      "title": "Company Launch",
      "description": "Successfully launched with a core team of experienced professionals."
    },
    {
      "date": "June 2024",
      "title": "Team Expansion",
      "description": "Doubled our team size and opened a new office location."
    }
  ],
  "text_after": "Looking forward to continued growth."
}
```

**Hyperlink-capable fields:** `title`, `text_before`, `events.title`, `events.description`, `text_after`

---

## `bar_chart`

Horizontal bar chart data. Render with any charting library or pure CSS.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Chart title. |
| `text_before` | string | no | Intro text. |
| `bars` | Array<{label, value}> | yes | Each bar: `label` (string), `value` (number, typically 0-100). |
| `text_after` | string | no | Closing text. |

```json
{
  "title": "Quarterly Revenue Growth",
  "text_before": "Revenue growth has been strong throughout the year.",
  "bars": [
    { "label": "Q1 2024", "value": 75.4 },
    { "label": "Q2 2024", "value": 82.1 },
    { "label": "Q3 2024", "value": 88.7 },
    { "label": "Q4 2024", "value": 95.2 }
  ],
  "text_after": "We expect this growth trend to continue."
}
```

**Hyperlink-capable fields:** `title`, `text_before`, `bars.label`, `text_after`

---

## `tool_recommendation`

Product/tool card with features and pricing.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Tool name. |
| `companyWebsite` | string | no | Tool website URL. |
| `pricing` | string | no | Pricing info (free text). |
| `productDescription` | string | no | Description of the tool. |
| `features` | string[] | no | Key feature list. |
| `headerColor` | string | no | Hex color for the card header. |

```json
{
  "title": "Hotjar",
  "companyWebsite": "https://hotjar.com",
  "pricing": "Free - $99/mo",
  "productDescription": "Heatmaps, session recordings, and surveys in one tool.",
  "headerColor": "#4CAF50",
  "features": [
    "Heatmaps",
    "Session Recordings",
    "Surveys",
    "Funnel Analysis"
  ]
}
```

> **Note:** Older content may use `companyUrl` instead of `companyWebsite`. Handle both.

**Hyperlink-capable fields:** `title`, `pricing`, `productDescription`, `features`

---

## `code_cluster`

Code snippet with description and language identifier.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Block heading. |
| `description` | string | no | Explanation of the code. |
| `code` | string | yes | The code content. |
| `language` | string | no | Language identifier (e.g. "json", "javascript"). |

```json
{
  "title": "Tracking conversions with GTM",
  "description": "Push a conversion event to the dataLayer after a successful checkout.",
  "code": "window.dataLayer.push({\n  event: 'conversion',\n  conversionValue: 49.99\n});",
  "language": "javascript"
}
```

**Hyperlink-capable fields:** `title`, `description`

---

## `product_recommendations`

Product cards with title, motivation, and optional image/price/tags.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | no | Section heading. |
| `introduction` | string | no | Intro text. |
| `products` | Array<{title, motivation, image?, price?, tags?}> | yes | Product entries. |

```json
{
  "title": "Top picks this month",
  "introduction": "Our most recommended products based on quality and value.",
  "products": [
    {
      "title": "Wireless Headphones",
      "motivation": "Great battery life, strong ANC, and comfortable fit.",
      "image": "https://via.placeholder.com/600x400",
      "price": "199",
      "tags": ["audio", "wireless", "daily use"]
    },
    {
      "title": "Ergonomic Office Chair",
      "motivation": "Excellent lumbar support for long workdays.",
      "price": "329",
      "tags": ["office", "comfort"]
    }
  ]
}
```

**Hyperlink-capable fields:** `title`, `introduction`
