import { getOpenAIClient, MODELS } from '../clients';
import { parseJsonResponse } from '../utils';

type MatchedKeyword = { keyword: string; description: string };
type Content = { text: string };

export async function selectHyperlinkKeywords(content: Content, matchedKeywords: MatchedKeyword[]) {
  try {
    const keywordsList = matchedKeywords.map((keyword) => `${keyword.keyword} (Description: ${keyword.description})`);
    const keywordsText = keywordsList.join('\n');

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an assistant that selects the most relevant keywords to create hyperlinks in a paragraph. Given a paragraph of text and a list of keywords with descriptions, you should select the keywords that make the most sense to hyperlink based on the content context.',
      },
      {
        role: 'user' as const,
        content: `Here is the content: '${content.text}'\n\nHere are the matched keywords:\n${keywordsText}\n\nWhich keywords should be hyperlinked, and at what positions?`,
      },
    ];

    const response = await (await getOpenAIClient()).chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'select_hyperlink_keywords',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    keyword: { type: 'string' },
                    positions: { type: 'array', items: { type: 'integer' } },
                  },
                  required: ['keyword', 'positions'],
                  additionalProperties: false,
                },
              },
            },
            required: ['keywords'],
            additionalProperties: false,
          },
        },
      },
    });

    const result = parseJsonResponse<{ keywords?: unknown[] }>(response);
    return result.keywords ?? [];
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
