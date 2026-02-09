# Deep Prompt Text Content Review

Every single prompt in the codebase, reviewed line by line for text quality, clarity, instruction effectiveness, and issues.

---

## Migration Note: tool_choice → response_format json_schema

Before the prompt reviews — here's the migration path from `tool_choice` to `response_format: { type: 'json_schema' }`:

### What changes

```typescript
// BEFORE (tool_choice)
const response = await client.chat.completions.create({
  model,
  messages,
  tools: [{
    type: 'function',
    function: {
      name: 'generate_blog_titles',
      description: '...',
      parameters: { type: 'object', properties: { ... }, required: [...] }
    }
  }],
  tool_choice: { type: 'function', function: { name: 'generate_blog_titles' } },
});
const result = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);

// AFTER (json_schema response_format)
const response = await client.chat.completions.create({
  model,
  messages,
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'generate_blog_titles',
      strict: true,
      schema: {
        type: 'object',
        properties: { ... },
        required: [...],
        additionalProperties: false  // REQUIRED for strict mode
      }
    }
  },
});
const result = JSON.parse(response.choices[0].message.content);
```

### Key differences
1. **`additionalProperties: false`** is required on EVERY object in the schema (including nested ones)
2. **ALL fields must be `required`** — use `"type": ["string", "null"]` for optional fields
3. **No `description` on the wrapper** — put guidance in the prompt text instead
4. **Result is in `message.content`** not `tool_calls[0].function.arguments`
5. **Refusals** come as `message.refusal` instead of content — handle this edge case
6. **Max 5 levels of nesting**, max 5000 total properties
7. **First call with a new schema has extra latency** (schema compilation), subsequent calls don't

### What stays the same
- The JSON schema syntax itself is the same
- `strict: true` guarantees schema adherence (like `tool_choice` did)
- Streaming works similarly

### When to keep tool_choice
Keep `tool_choice` only when you're actually doing **tool/function calling** (e.g., the model deciding which function to call). For pure "give me structured output" — use `response_format`.

---

## 1. Title Generation (`titles/generate-titles.ts` + `generate-single-title.ts`)

### Current system prompt (identical in both files):
> "You are an article title generator. You are responsible for creating catchy, SEO-friendly, and grammatically correct blog titles based on the given industry and number of titles requested by the user. The titles should not be subjective posts but should be posts that could be generated with AI. Ensure the SEO title and focus keyword match Yoast's guidelines. And do NOT make them to cliche and generic, make them actually interesting."

### Issues

| # | Problem | Quote | Fix |
|---|---------|-------|-----|
| 1 | **Typo** — "to cliche" should be "too cliché" | `"do NOT make them to cliche"` | Fix spelling |
| 2 | **Contradictory instruction** — "should be posts that could be generated with AI" literally tells the model to make AI-sounding titles | `"should not be subjective posts but should be posts that could be generated with AI"` | Remove entirely. This was probably meant to say "factual/objective posts" but literally says "make them sound like AI wrote them" |
| 3 | **Vague negative instruction** — "do NOT make them to cliche and generic" tells the model what NOT to do but gives zero examples of what good looks like | `"do NOT make them to cliche and generic, make them actually interesting"` | Replace with specific positive guidance: what makes a title "interesting"? Specific angles, unexpected takes, concrete numbers, action verbs? |
| 4 | **No audience/industry context** — the model only gets `industry: string` but nothing about WHO reads these blogs, what tone fits, or what the company does | full prompt | Add company profile context |
| 5 | **No examples** — zero few-shot examples of good vs bad titles | full prompt | Add 2-3 examples of titles that work vs ones that don't |
| 6 | **Duplicate prompt** — exact same text in two files | both files | Merge into one shared constant/function |

### Existing titles injection:
> "This is the titles already generated so DO NOT generate these again: " + existingTitles.join(', ')

- **Issue:** Joins titles with commas into one flat string — for 50+ titles this becomes an unreadable wall. Use a numbered list or JSON array instead.

### User prompt:
> "Generate {n} blog titles for the industry: {businessType}. Write the titles in {language} and make sure that the titles are grammatically correct, professional sounding, and SEO-friendly."

- **Issue:** Repeats "grammatically correct" and "SEO-friendly" from system prompt. Redundant tokens.
- **Issue:** "professional sounding" is vague — professional for a law firm is different than for a skate shop.

---

## 2. Blog Structure Generation (`blog-generation/generate-structure.ts`)

### System prompt:
> "You are a blog post structure generator. Your job is to create a structured blog post outline based on the given title. Ensure the structure follows SEO best practices and is engaging for the readers. The structure should include the following blocks: introduction, paragraphs, images, FAQ, conclusion, and other appropriate elements. The blocks should be presented in an array with an order integer for each block. The title of the blog post is: {title}. Write the structure in English and recommend it to be long and follow Yoast's SEO guidelines.\nDo not hallucinate"

### Issues

| # | Problem | Quote | Fix |
|---|---------|-------|-----|
| 1 | **Hardcoded "Write the structure in English"** — but the system supports multiple languages | `"Write the structure in English"` | Make language configurable: `"Write the structure in {language}"` |
| 2 | **"Do not hallucinate" is meaningless for structure generation** — this is a creative/planning task, not factual recall. There's nothing to hallucinate about when generating a structure outline. | `"Do not hallucinate"` | Remove — it's noise |
| 3 | **"recommend it to be long"** — vague. How long? 8 sections? 15? | `"recommend it to be long"` | Specify: "Aim for 10-14 blocks total for a comprehensive post" |
| 4 | **Lists mandatory elements then also says "should include introduction, paragraphs..."** — redundant with the JSON that follows | system prompt vs element constants | Remove the inline list from the prompt since the structured element data already specifies this |
| 5 | **No guidance on element variety** — model tends to produce: intro, paragraph, paragraph, paragraph, list, paragraph, FAQ, conclusion | full prompt | Add: "Vary element types — don't use more than 2 consecutive paragraphs without a visual or structured element between them" |

### Element descriptions (from `structure-constants.ts`):

**Paragraph requirements:**
> "Should be used around 3 times minimum for each post. Never contains any form of list, only text. Min 165 words. ALWAYS use <br> tags for linebreak multiple times. Also use <strong> and <em> tags."

- **Issue:** Mixes structure planning concerns with content formatting concerns. The structure generator doesn't write content — it plans which blocks go where. Formatting instructions (`<br>`, `<strong>`) belong in the content generation prompt, not here.

**Image requirements:**
> "ALWAYS TWO NEVER LESS THAN THAT."

- **Issue:** Screaming caps. Just say "Minimum 2 images per post."

**Code cluster:**
> "This block MUST ONLY be used if the blog post is a code tutorial... DO NOT include actual code in this block; it will be added later."

- **Good —** clear constraint. But "MUST ONLY" caps is unnecessary.

---

## 3. Blog Post Content Generation (`blog-generation/generate-blog-post.ts`)

**This is the most important prompt. Let's go line by line.**

### System prompt:
> "You are a blog post content generator. Generate the content for each block according to the given structure."

- **Issue:** The role is flat and generic. "Blog post content generator" gives the model no personality, no expertise, no writing style to anchor to.
- **Fix:** "You are a senior content writer specializing in {industry}. You write in a {tone} voice for {audience}."

> "Ensure the blog post is long and follows Yoast's SEO guidelines."

- **Issue:** "long" is not a quality goal. Longer is not better — relevant and thorough is better.
- **Fix:** "Write thorough, detailed sections. Each paragraph block should be at least 150 words."

> "Follow the requirments closly"

- **Issue:** Two typos — "requirments" and "closly"

> "here is a example on how to use br, em and strong tags correclty (this is just a generic example paragraph so ignore the subject):"

- **Issue:** "a example" should be "an example". "correclty" is misspelled. Tells the model to "ignore the subject" which is confusing.

> [Lorem ipsum style example paragraph]

- **Issue:** The example uses Latin placeholder text. The model learns nothing about WRITING QUALITY from this — only tag placement. A real example with actual English content would teach both formatting AND style simultaneously.

> "Also remember that the list blocks should never contain any products recommendations becuase we have a seperate block for that."

- **Issue:** "becuase", "seperate" — typos. But the instruction itself is good and important.

> "Do not hallucinate. Try to provide useful information to the reader and do NOT make it generic ans soul less."

- **Issues:**
  - "ans soul less" — typo for "and soulless"
  - "Do not hallucinate" conflicts with creative writing — the model IS making things up by nature when writing a blog post
  - "do NOT make it generic" is a useless negative instruction. What does NON-generic look like? Give an example.
- **Fix:** "Ground claims in specific examples, data points, or real-world scenarios. Reference named tools, companies, or industry practices rather than speaking in generalities."

### Fake assistant pre-message:
> "I understand that i should avoid cliche content that sounds AI generated, such as using words like "crucial" or terms like "to days digital age" I also understand that when referring to the company I should not write "Companies like ..." but I should talk about it in first person: "Our solutions...". The most important part is that we keep a language that is not full of cliche and AI words.". I should also write long, becuase longer content is better. It is also VERY important that I use a good mix of <br>, <em> and <strong> tags. I am in my next message going to write the blog post."

- **Issues:**
  - "to days digital age" — should be "today's digital age"
  - "becuase" — typo again
  - "longer content is better" — false. Better content is better.
  - "i" should be "I"
  - This is a **fake assistant message** injected to simulate the model agreeing with instructions. This pattern is now considered an anti-pattern in prompt engineering — it's manipulation rather than instruction. Modern models respond better to clear system instructions.
  - The closing `."` has mismatched quotes
- **Fix:** Move these instructions into the system prompt as clear rules. Remove the fake assistant message entirely.

### Business-aware user message:
> "This blog post should be non biast and should focus on providing quality information to the reader, we should not only plug our own product, but mentioning once and twice wont hurt. Think about how Hubspot still mentions competitors and focuses on writing quality content to the readers"

- **Issues:**
  - "non biast" — should be "unbiased"
  - "wont" — should be "won't"
  - HubSpot reference is good as an analogy but vague — what specifically about HubSpot's approach?
- **Good parts:** The strategic guidance about not being too self-promotional is actually excellent. This should be in EVERY company-aware prompt, not just as a user message.

### Hardcoded cost calculation:
```typescript
const inputCost = (inputTokens / 1_000_000) * 0.15;
const outputCost = (outputTokens / 1_000_000) * 0.6;
```
- **Issue:** These rates are for an older model. When models change, these become wrong silently. Either pull from a config or remove cost calculation from the generation layer.

---

## 4. Element Operations

### 4a. Generate New Element (`blog-elements/generate-new-element.ts`)

> "You are responsible for generating a new blog post element of type '{elementType}' based on the given note and context. Ensure the content fits seamlessly within the blog post while following best SEO practices. The generated content should maintain the exact structure as defined in the function parameters."

- **Issue:** "maintain the exact structure as defined in the function parameters" — this is about JSON schema compliance, not content quality. The model will follow the schema anyway with `tool_choice`/`json_schema`. This wastes tokens.

> "The generation note is what the user writes, YOU MUST FUCKING follow this , DO NOT add another element, WHAT THE USER WRITES IS WHAT IS IMPORTANT."

- **Issues:**
  - Profanity in production code — unprofessional if anyone audits this
  - ALL CAPS screaming — research shows this doesn't improve compliance. Models respond to clarity, not volume.
  - The actual instruction ("follow the user's generation note") is buried under anger
- **Fix:** "Priority: The generation note below is the primary instruction. Follow it exactly. Generate only the requested element type — do not add extra elements."

### Context injection:
> `"Blog Post Structure:\nElements Above:\n${JSON.stringify(elementsAbove, null, 2)}\nElements Below:\n${JSON.stringify(elementsBelow, null, 2)}"`

- **Issue:** Raw JSON dumps of element structures. The model has to parse this mentally. Would be more effective as a brief summary: "The element above is a paragraph about X. The element below is a list about Y."

### 4b. Regenerate Element (`blog-elements/regenerate-element.ts`)

> "You are responsible for regenerating a blog post element of type '{elementType}' into {targetCount} element(s) of type '{targetType}' based on the given note and context."

- **Fine** as a functional description, but again — no writing style, no company context, no quality guidance.

> "Regeneration Note (THIS IS EXTREMELY IMPORTANT; THIS IS WHAT THE USER IS WRITING; THIS WEIGHS 3 TIMES AS MUCH AS ANY OTHER INPUT): '{regenerationNote}'"

- **Issues:**
  - "WEIGHS 3 TIMES AS MUCH" — this isn't how language models work. There's no weight multiplier. The model either follows the instruction or doesn't.
  - The caps and emphasis waste tokens
- **Fix:** Use XML tags for priority:
  ```
  <primary_instruction>{regenerationNote}</primary_instruction>
  <context>Title: {blogTitle}, Excerpt: {blogExcerpt}</context>
  ```

### 4c. Enhance Readability (`blog-elements/enhance-readability.ts`)

> "You are responsible for enhancing a blog post element to improve its readability. Add em, strong, and br tags to make the content easier to read."

- **OK** but very narrow — only about tag insertion, not about actual readability (sentence structure, word choice, flow).

> [Lorem Ipsum before/after example]

- **Major issue:** The example shows tag insertion on LATIN TEXT. The model learns nothing about WHERE to place emphasis tags meaningfully — it only sees mechanical insertion. A real English example would teach: "put `<strong>` on key concepts, `<em>` on important qualifiers, `<br><br>` between distinct ideas."

> `max_completion_tokens: 500`

- **Issue:** 500 tokens is extremely tight. For a long paragraph element, this will cause truncation. Should be proportional to input length.

### 4d. Case Study Generation (`blog-elements/generate-case-study.ts`)

> "You are an expert content creator specializing in crafting detailed and accurate case studies."

- **Good** role assignment.

> "The case study MUST be a real case study, you should NOT make up one. So pick a REAL case study and real information."

- **Issue:** The model's training data has a cutoff date. It may not have real case studies for niche industries. This instruction creates a lose-lose: either the model hallucinates a "real" case study (worse than an honest fictional one) or refuses to generate.

> "So WHATEVER you do, DO NOT pick some bullshit example name such as XYZ corp"

- **Issue:** Profanity again. And "XYZ corp" is oddly specific — suggests this was a reactive fix for a specific bad output rather than a systematic prompt improvement.

> "If it is not a real case study you destroy our company image."

- **Issue:** Emotional manipulation/threat. Models don't respond to social pressure. This just adds noise and actually makes the model MORE likely to hallucinate something that sounds real but isn't.

- **Fix:** Two approaches:
  1. **Honest approach:** "Generate a realistic case study based on common outcomes in the {industry} sector. Use a plausible company name and realistic metrics. Mark with [Example case study] so the user knows to verify."
  2. **Web search approach:** Add a step that searches for real case studies before generation, then the model synthesizes from real sources.

> "Make the color match the companies logo"

- **Issue:** "companies" should be "company's". Also — the model can't look up logo colors. It can guess based on brand knowledge from training data, but this is unreliable. The `fetchLogoUrl` function already handles the logo; color matching should come from the actual logo, not the model's guess.

---

## 5. Language Processing

### 5a. Humanize Content (`language/humanize-content.ts`)

**System prompt:**
> "You are a blog assistant, your goal is taking this paragraph, rewriting it in the exact same subject but making the content ALOT more useful by highlighting real-world examples, writing it more engaging like a blog and not make it sound like a robot but still not make it sound corny, and giving more credible insights that users actually can take action from."

- **Issues:**
  - "ALOT" — should be "a lot"
  - Run-on sentence — hard to parse even for a human
  - "not make it sound corny" is vague — what's corny?
- **Good parts:** "highlighting real-world examples", "credible insights that users actually can take action from" — these are specific and useful.

> "Another idea is writing in We format and not just lexion text"

- **Issue:** "lexion" is not a word. Probably means "lexicon" or maybe "dry/academic text"? This is confusing to both humans and models.

> "but this paragraph is still part of a larger post so do not write a conclusion or that type of bullshit"

- **Issue:** "bullshit" — more profanity. The instruction is valid though.
- **Fix:** "This is a single section within a larger blog post — do not add introductory or concluding sentences that reference the overall post."

> "IF YOU DO NOT FOLLOW THIS JSON SCHEMA IN ALL OF YOUR RESPONSES YOU BREAK EVERYTHING:"

- **Issue:** ALL CAPS threat. With `response_format: json_schema` this becomes unnecessary — the schema is enforced mechanically.

**Feedback steps:**
1. "I believe this is a little bit too many cliche words and phrases."
2. "Great, take the text above and write it by choosing synonyms that are simple but that you might not choose by default to make it more unique and less AI. You should not make it too fancy. You should not at all change the subject, JUST the text phrasing to use words that you usually would not pick. You should not make it harder to read though, do not make it any fancier. But now is the time to clear up, do not make it so that it sounds we are writing for a toddler."
3. "Good, finally I want you to add a decent amount of em, strong, and br tags. If you write a br tag, write a double one."

- **Issues:**
  - Step 2 is a 90-word rambling instruction with 5 "should not" clauses. Hard to follow.
  - Step 2 contradicts itself: "simple but that you might not choose by default" + "should not make it too fancy" + "do not make it any fancier" + "do not make it so that it sounds we are writing for a toddler" — the model is getting pulled in 4 directions at once.
  - Step 3 is about formatting, not content quality — should be separate from the humanization pass.

- **Fix for step 2:** "Rephrase using natural, varied vocabulary. Avoid words AI models default to (crucial, comprehensive, leveraging, furthermore). Keep the reading level at grade 8-10 — clear and professional, not dumbed down."

### 5b. Improve Language (`language/improve-language.ts`)

**System prompt:**
> "You are a blog assistant, rewrite this content on same subject, more useful and engaging, avoid clichés and false claims."

- **Issue:** Very terse compared to humanize. Missing: what makes content "useful"? What makes it "engaging"? No examples of either.

**Feedback steps:**
1. "Too many cliché words and phrases."
2. "Rewrite with simpler but less default word choices; keep meaning."
3. "Keep it professional; remove goofy phrasing."
4. "Add a decent amount of em/strong and double br tags, but sparingly."

- **Better** than humanize steps — shorter, clearer, less contradictory. But step 4 says "decent amount" AND "sparingly" in the same sentence — pick one.

---

## 6. Dictionary

### 6a. Generate Keywords (`dictionary/generate-keywords.ts`)

> "You are a keyword generator. Generate a list of keywords that start with the given letter, related to the given subject, and provide a one-paragraph description for each keyword."

- **Fine** for the task.

> "Ensure the keywords are grammatically correct and relevant to the subject. Try to keep the keywords one word only but the most important part is that the words and descriptions are HIGHLY SEO friendly, and also offers a short and objective definition of the word in the context of the given subject."

- **Issue:** "HIGHLY SEO friendly" — what does this mean specifically? Keyword density? Search volume? Relevance? Be specific.

> "You should also give a focus keyword which should be what users is most likely to search for when they want to learn the definition of the keyword."

- **Issue:** "users is" — should be "users are"

> "It is VERY important that ALL the words start with the letter: '{letter}'"

- **Issue:** Repeats the letter constraint 3 times across the prompt (system message, user message, and function description). Once clearly is enough. The repetition suggests the model kept failing this — which means the real fix is a validation step post-generation, not prompt repetition.

### 6b. Generate Explanation (`dictionary/generate-explanation.ts`)

> "You are an expert writer. Generate three paragraphs to explain the given keyword."

- **OK** but "expert writer" is generic.

> "The most important part is that the descriptions is HIGHLY SEO friendly and you should also bake in keywords for SEO in the descriptions."

- **Issue:** "descriptions is" — grammar error. "bake in keywords" — vague. How many? How naturally?

> "The foucs keyword we should SEO optimize for is: {focusKeyword}, but the focus keyword should only be present 12 times in the text."

- **Issue:** "foucs" — typo. And "only 12 times" is oddly specific and probably too many. A focus keyword appearing 12 times in 3 paragraphs would be extreme keyword stuffing. Yoast recommends 1-3% keyword density.
- **Fix:** "Include the focus keyword naturally 3-5 times across all paragraphs. Avoid keyword stuffing."

> "The SEO search should start with 'What is...' or 'What are...', this is going to be the google featured snippet title for the definition"

- **Issue:** "SEO search" is confusing — this means the `seo_search` field in the schema. Call it what it is: "The `seo_search` field should be a question format starting with 'What is...' or 'What are...'"

> "The meta description should NOT be longer then 145 charachters."

- **Issues:** "then" → "than", "charachters" → "characters"

> "Also use a couple of <strong> and <em> tags in the text to highlight important words. DO NOT use markdown ** use rich text strong and em."

- **Good** instruction — explicit about HTML vs markdown. Could be cleaner: "Use `<strong>` and `<em>` HTML tags for emphasis. Do not use markdown formatting."

### 6c. Short Description (`dictionary/generate-short-description.ts`)

> "You are an expert writer. Generate a one-paragraph description for the given word."

- **Fine.**

> "The description should be grammatically correct and professional sounding, and the English should still be relatively easy."

- **Issue:** "relatively easy" is vague. Grade level? Like a newspaper article?

> Tool parameter: "Should ONLY be around 25 words."

- **Issue:** Says "one-paragraph description" in the prompt but "25 words" in the schema. A 25-word paragraph isn't really a paragraph. These conflict. Pick one.

---

## 7. Categories

### Generate Categories (`categories/generate-categories.ts`)

> "You are an AI trained to analyze a list of blog titles and generate a list of relevant categories."

- **Issue:** "You are an AI trained to" — unnecessary meta-framing. Just say what to do.

> "Each category should be broad enough to encompass multiple titles but specific enough to be meaningful."

- **Good** — clear constraint.

> "Ensure that at least 6 categories are generated"

- **Issue:** Already in the schema's `minItems`. Redundant.

### Categorize Titles (`categories/categorize-titles.ts`)

> "You are an AI that categorizes a list of titles into the given categories."

- **Fine** but minimal. No guidance on how to handle ambiguous titles, how many categories per title is appropriate, etc.

---

## 8. Quillo / Analysis

### Blog Analysis (`quillo/analyze-blog-post.ts`)

> "You are an AI assistant specialized in analyzing and improving blog posts. You have deep knowledge of SEO, content writing, and blog structure."

- **Good** role definition.

> "Analyze the given blog post thoroughly, considering its structure, content quality, SEO optimization, and overall effectiveness."

- **Good** — clear scope.

> "When evaluating, be direct and honest. Do NOT sugarcoat your feedback."

- **Good** tone setting.

> "The content should sound human and NOT be repetitive."

- **Issue:** This instruction is about the blog content being analyzed, but it reads like it's about the analysis itself. Ambiguous. Move to the evaluation criteria.

User message:
> "Be ruthless in your feedback - I appreciate direct, honest criticism"

- **Issue:** Repeats the system prompt's "be direct and honest." Redundant.

### Continue Chat (`quillo/continue-chat.ts`)

> "The user has provided the following question, if the question is something that is not related to the blog post, refuse to answer it, but if the qusetion is related to the blog post you should not say that, then just go on as normal:"

- **Issues:** "qusetion" — typo. Run-on sentence. The logic "if related, don't say that" is confusingly phrased.
- **Fix:** "Answer the following question about the blog post. If the question is unrelated to the blog post, politely decline."

### SEO Analysis (`quillo/generate-seo-analysis.ts`)

> "You are responsible for analyzing a company's SEO profile. You should provide clear and understandable English explanations about the company's SEO performance and recommend focus keywords."

- **Good** — clear and simple.
- **Note:** This is the ONLY prompt that already uses `response_format: json_schema` instead of `tool_choice`. Use this as a reference implementation for migrating the others.

### Create Facebook Post (`quillo/create-facebook-post.ts`)

> "You turn blog posts and articles into Facebook posts. The post should be human sounding and NOT cliche."

- **Issue:** "NOT cliche" — no examples of what cliché vs non-cliché social posts look like.

> "Use emojis and hashtags for emphasis, but no markdown or formatting like bold or italics."

- **Good** — platform-specific formatting guidance.

> `Use this URL format for the post slug: https://nordwebb.com/${slug}/.`

- **Issue:** Hardcoded domain `nordwebb.com`. This should come from company settings.

---

## 9. Products

### Generate Motivations (`products/generate-motivations.ts`)

> "You are an AI that generates funny, SEO-friendly, engaging motivations for product titles."

- **Issue:** "funny" might not be appropriate for all companies. A law firm doesn't want funny product motivations. Should be configurable based on company tone.

### Populate Recommendations (`products/populate-recommendations.ts`)

> "You are an AI that helps select the best products for a blog post's recommended products section based on the given themes."

- **Fine** for the task.

> "Also provide funny, SEO-friendly motivations around 60 words with <strong> tags."

- **Same issue:** "funny" hardcoded tone. Also "around 60 words" — is that per motivation or total?

---

## 10. Post Linking (`post-linking/generate-recommended-posts.ts`)

> "You are an article recommender. Based on the given list of blog titles, recommend related posts for each title based on relevance, content similarity, and potential reader interest."

- **Good** criteria.

> "Make sure that titles do not recommend itself and make it so that the recommendations are distributed evenly among all the titles."

- **Issue:** "itself" → "themselves". But the instruction about even distribution is smart.

> "Make the recommendations based on what is most logical."

- **Issue:** Vague filler. Remove.

---

## 11. Hyperlink Processing

### Process Hyperlinks (`keyword-linking/process-hyperlinks.ts`)

> "You are responsible for taking a text paragraph and choosing the three most relevant hyperlink positions to keep. Select hyperlink positions and words that are most relevant to the text to make it more engaging. What only keeping three hyperlinks mean is the following, as you can see we have hyperlinks and we have matched_positions, keeping three hyperlinks is not only to keep three hyperlinks, but over hte whole element we should only have three matched positions, so if we add up the len of all the matched_positions array the result should be max 3. You must choose at least two hyperlinks, but no more than three in total."

- **Issues:**
  - "hte" → "the"
  - The explanation of "what keeping three hyperlinks means" is 80 words of confused explanation. This reads like someone debugging out loud.
  - "len of all the matched_positions array" — code-speak in a natural language prompt
- **Fix:** "Select the 2-3 most contextually relevant keywords for hyperlinking. Each keyword should have exactly 1 matched position. Total matched positions across all keywords: minimum 2, maximum 3."

### Select Hyperlink Keywords (`keyword-linking/select-hyperlink-keywords.ts`)

> "You are an assistant that selects the most relevant keywords to create hyperlinks in a paragraph."

- **Fine.**

> "Given a paragraph of text and a list of keywords with descriptions, you should select the keywords that make the most sense to hyperlink based on the content context."

- **Good** — context-based selection.

---

## 12. Autopilot Pipeline (`quillo/autopilot/`)

### Element Suggestions
> "You are a specialized AI assistant focused on enhancing blog post content. Suggest around 5-6 useful elements and never suggest anything after FAQ/conclusion."

- **Good** — specific count and boundary constraint.

### Content Improvements
> "Improve content quality with tools enhance/humanize/regenerate."

- **Issue:** This is the entire user message guidance. Way too terse — no criteria for WHEN to enhance vs humanize vs regenerate.
- **Fix:** "Review each element for quality. Apply: 'enhance' for formatting issues (missing br/strong/em), 'humanize' for AI-sounding text, 'regenerate' for factually weak or irrelevant content."

### Paragraph Suggestions
> "Good, but now we have too many graphical elements. Add 4-5 paragraphs between graphical elements for smoother reading."

- **Issue:** Assumes "too many graphical elements" is always true. This is a fixed instruction regardless of the actual post. Should be conditional.

### Image Specifications
> "Review this blog post and provide specs for existing images only. Include style_guide and per-image alt+description+element_id."

- **Fine** — concise and clear.

---

## Summary: Top 10 Changes by Impact

1. **Replace the Lorem Ipsum example** in blog-post generation with a real English paragraph showing the writing style you want
2. **Remove the fake assistant message** from blog-post generation — put those rules in the system prompt
3. **Fix all typos** (requirments, closly, correclty, becuase, seperate, biast, qusetion, foucs, charachters, lexion, hte) — there are 20+ across the codebase
4. **Remove profanity** (FUCKING, bullshit, destroy our company image) — replace with clear priority instructions using XML tags
5. **Remove "should be posts that could be generated with AI"** from title generation — this literally tells the model to make AI-sounding titles
6. **Add company context** (industry, audience, tone) to every content-generating prompt
7. **Replace vague negatives** ("don't be generic", "don't hallucinate") with specific positives ("reference named tools and companies", "include specific statistics or examples")
8. **Fix the focus keyword density** from "12 times" to "3-5 times naturally" in dictionary explanations
9. **Add few-shot examples** to at least: title generation, blog content, and humanize pipeline
10. **Clean up the humanize feedback steps** — step 2 has 5 contradictory "should not" clauses that pull the model in opposite directions

---

## Appendix: Complete Typo/Grammar List

| File | Error | Fix |
|------|-------|-----|
| `generate-blog-post.ts` | "requirments closly" | "requirements closely" |
| `generate-blog-post.ts` | "correclty" | "correctly" |
| `generate-blog-post.ts` | "a example" | "an example" |
| `generate-blog-post.ts` | "becuase" | "because" |
| `generate-blog-post.ts` | "seperate" | "separate" |
| `generate-blog-post.ts` | "ans soul less" | "and soulless" |
| `generate-blog-post.ts` | "non biast" | "unbiased" |
| `generate-blog-post.ts` | "wont" | "won't" |
| `generate-blog-post.ts` (assistant) | "to days digital age" | "today's digital age" |
| `generate-blog-post.ts` (assistant) | "i should" | "I should" |
| `generate-blog-post.ts` (assistant) | "becuase" | "because" |
| `generate-titles.ts` | "to cliche" | "too cliché" |
| `generate-single-title.ts` | "to cliche" | "too cliché" |
| `generate-explanation.ts` | "foucs keyword" | "focus keyword" |
| `generate-explanation.ts` | "descriptions is" | "descriptions are" |
| `generate-explanation.ts` | "longer then" | "longer than" |
| `generate-explanation.ts` | "charachters" | "characters" |
| `generate-explanation.ts` | "reativly" | "relatively" |
| `generate-keywords.ts` | "users is" | "users are" |
| `humanize-content.ts` | "ALOT" | "a lot" |
| `humanize-content.ts` | "lexion" | unclear — rephrase |
| `continue-chat.ts` | "qusetion" | "question" |
| `process-hyperlinks.ts` | "hte" | "the" |
| `generate-recommended-posts.ts` | "itself" | "themselves" |
| `generate-case-study.ts` | "companies logo" | "company's logo" |
| `structure-constants.ts` | "ALWAYS TWO NEVER LESS THAN THAT" | "Minimum 2 images per post" |
