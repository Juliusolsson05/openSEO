import { MODELS } from '@/server/ai/clients';
import { generateBlogFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { callModel, type ChatMessage } from '@/server/ai/providers';

export async function generateBlogPost(
  seoTitle: string,
  focusKeyword: string,
  title: string,
  structure: Record<string, unknown>,
  model = MODELS.OPENAI_DEFAULT,
  businessAware = false,
  businessDescription?: string,
  businessName?: string,
): Promise<{ elements: Array<Record<string, unknown>>; usage: unknown; cost: Record<string, number> }> {
  if (businessAware && (!businessDescription || !businessName)) {
    throw new Error('business_description and business_name must be provided when business_aware is True');
  }

  const systemPrompt = `You are a senior content writer. You write blog posts that readers actually want to finish — posts that teach something specific, take a clear position, and leave the reader with actionable knowledge.

WRITING PHILOSOPHY:
- Every paragraph must teach something specific. If a paragraph could apply to any company in any industry, it is too generic — you must include a named company, a real tool, a specific statistic, or a concrete outcome.
- Take a position. Do not present all sides equally — argue for what works based on evidence. "It depends" is never an acceptable conclusion for a section.
- Write like you are explaining to a smart colleague over coffee, not presenting to a boardroom.
- The reader should come away being able to DO something they could not do before reading.

INTRODUCTION RULES:
- NEVER start with "In this post..." or "This article explores..." or "Let's dive into..." or any variation of announcing what the post will cover.
- NEVER start with "In today's [digital age/landscape/world]..."
- Start with ONE of these hooks: a specific real-world problem the reader recognizes, a surprising statistic, a bold or contrarian claim, or a short 2-sentence story.
- The reader must feel a reason to keep reading within the first 2 sentences.

SPECIFICITY RULES:
- Name real companies, tools, and people. Use specific numbers and outcomes.
- "Many companies have found success with..." is NEVER acceptable. Say WHO found success, WHAT they did, and WHAT the result was.
- When making a claim, back it up: "Notion grew 3x faster than Confluence despite having fewer features because they focused on UX simplicity" — not "simplicity can drive growth."
- Each paragraph section must reference at least one real company, tool, framework, or data point.

FOCUS KEYWORD RULES:
- Use the focus keyword naturally 4-6 times across the entire post.
- Do NOT put it in the first sentence of every section.
- Use natural synonyms and related phrases to avoid repetition.

STYLE RULES:
- Mix sentence lengths: some under 8 words, some over 25. Vary the rhythm.
- Use rhetorical questions sparingly — 1-2 per post maximum.
- Start some sentences with "But", "And", or "So" for natural conversational flow.
- Vary paragraph length — some 2 sentences, some 5.
- Use "you" and "your" to address the reader directly.
- Use <br><br> for line breaks between ideas within a section.
- Use <strong> for key concepts (2-3 per paragraph section), <em> for emphasis (1-2 per paragraph section).

WORDS AND PHRASES TO NEVER USE:
- "crucial", "pivotal", "paramount", "essential" (pick a specific reason instead)
- "leverage" as a verb, "utilize", "facilitate"
- "comprehensive", "robust", "cutting-edge", "game-changer", "groundbreaking"
- "navigate the complexities", "in the ever-evolving landscape"
- "it's important to note that", "it goes without saying"
- "dive into", "delve into", "unpack"
- "a myriad of", "a plethora of"
- "seamlessly", "effortlessly"
- "stakeholder", "synergy", "paradigm shift"

STRUCTURE RULES:
- List blocks should never contain product recommendations — we have a separate block for that.
- Each paragraph block must be at least 165 words.
- End sections with a concrete takeaway, not a summary sentence like "As we can see..."`;

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Write a blog post titled "${title}".
Focus keyword: "${focusKeyword}" (use naturally 4-6 times total, not in every section).
SEO title: "${seoTitle}"`,
    },
  ];

  if (businessAware) {
    messages.push({
      role: 'user',
      content: `COMPANY CONTEXT (use sparingly — mention naturally at most 2 times in the entire post, never more than 1 sentence at a time):
Company name: ${businessName}
When referencing the company, use first person ("our product", "we built").
Do NOT dedicate a full paragraph to the company — weave mentions in naturally, like an aside.
Focus on providing genuine value to the reader. Think about how HubSpot writes — they mention their own tools occasionally but the post is primarily educational.

Company description:
"""${businessDescription}"""`,
    });
  }

  const schema = generateBlogFunctionParameters(JSON.stringify(structure));

  const { json, usage } = await callModel<{
    blocks: Record<string, unknown>[] | Record<string, unknown>;
  }>({
    model,
    system: systemPrompt,
    messages,
    jsonSchema: {
      name: 'generate_blog_post',
      schema,
    },
  });

  if (!json) throw new Error('generate-blog-post: no JSON returned from model');

  const elements: Array<Record<string, unknown>> = [];
  if (Array.isArray(json.blocks)) {
    for (const block of json.blocks) {
      for (const [blockKey, blockValue] of Object.entries(block)) {
        const [elementType] = blockKey.split(/_(?=\d+$)/);
        elements.push({ type: elementType, content: blockValue });
      }
    }
  } else {
    for (const [blockKey, blockValue] of Object.entries(json.blocks)) {
      const [elementType] = blockKey.split(/_(?=\d+$)/);
      elements.push({ type: elementType, content: blockValue });
    }
  }

  const inputTokens = usage.inputTokens;
  const outputTokens = usage.outputTokens;
  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.6;

  return {
    elements,
    usage,
    cost: { inputCost, outputCost, totalCost: inputCost + outputCost },
  };
}
