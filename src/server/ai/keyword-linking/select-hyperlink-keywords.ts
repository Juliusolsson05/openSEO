import { MODELS } from '../clients';
import { callModel } from '../providers';

type MatchedKeyword = { keyword: string; description: string };
type Content = { text: string };

export async function selectHyperlinkKeywords(content: Content, matchedKeywords: MatchedKeyword[]) {
  try {
    const keywordsList = matchedKeywords.map((keyword) => `${keyword.keyword} (Description: ${keyword.description})`);
    const keywordsText = keywordsList.join('\n');

    const { json: result } = await callModel<{ keywords?: unknown[] }>({
      model: MODELS.OPENAI_DEFAULT,
      system:
        'You are an assistant that selects the most relevant keywords to create hyperlinks in a paragraph. Given a paragraph of text and a list of keywords with descriptions, you should select the keywords that make the most sense to hyperlink based on the content context.',
      messages: [
        {
          role: 'user',
          content: `Here is the content: '${content.text}'\n\nHere are the matched keywords:\n${keywordsText}\n\nWhich keywords should be hyperlinked, and at what positions?`,
        },
      ],
      jsonSchema: {
        name: 'select_hyperlink_keywords',
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
    });

    return result?.keywords ?? [];
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
