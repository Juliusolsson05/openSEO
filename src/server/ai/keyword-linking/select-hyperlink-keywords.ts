import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

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

    const functionParameters = {
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
          },
        },
      },
      required: ['keywords'],
    };

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      functions: [
        {
          name: 'select_hyperlink_keywords',
          description: 'Selects the most relevant keywords for hyperlinking in a paragraph.',
          parameters: functionParameters,
        },
      ],
      function_call: {
        name: 'select_hyperlink_keywords',
      },
    });

    const jsonResponse = response.choices[0]?.message.function_call?.arguments ?? '{}';
    const selectedKeywords = (JSON.parse(jsonResponse) as { keywords?: unknown[] }).keywords ?? [];
    return selectedKeywords;
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}

void getAnthropicClient;
