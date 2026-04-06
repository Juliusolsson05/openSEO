import { MODELS } from '../clients';
import { callModel } from '../providers';

export async function generateExplanation(
  subject: string,
  language: string,
  keyword: string,
  shortDescription: string,
  focusKeyword: string,
) {
  try {
    const { json } = await callModel<Record<string, unknown>>({
      model: MODELS.OPENAI_DEFAULT,
      system:
        'You are an expert writer. Generate three paragraphs to explain the given keyword. Each paragraph should have a title and a text body. The explanation should be detailed, informative, and relevant to the given subject and short description. Ensure the text is grammatically correct and professional sounding, but the English should still be relatively easy to read. The most important part is that the descriptions are highly SEO-friendly and you should also naturally include keywords for SEO in the descriptions. You should also write a featured Google snippet — this should be a short description that is tailored to be chosen for the featured Google snippet for the word. Additionally, provide a list of synonyms, antonyms, usage examples, and related keywords for the word. Finally, provide a meta description and three FAQs with questions and answers related to the keyword.',
      messages: [
        {
          role: 'user',
          content:
            `Generate three paragraphs to explain the keyword '${keyword}' for the subject: ${subject}. ` +
            `Write the explanation in ${language}. The short description of the keyword is: ${shortDescription}. Keep in mind that you should write relatively easy English and make it clear and concise. ` +
            `The focus keyword we should SEO optimize for is: ${focusKeyword}, but include the focus keyword naturally — do not force it. ` +
            `The SEO search should start with 'What is...' or 'What are...' — this is going to be the Google featured snippet title for the definition. ` +
            `The meta description should NOT be longer than 145 characters. ` +
            `Also use a couple of <strong> and <em> tags in the text to highlight important words. DO NOT use markdown ** — use rich text strong and em. Also break up long paragraphs with double <br> (<br><br>) so that everything is very easy to read. ` +
            'Do not hallucinate, write good content.',
        },
      ],
      jsonSchema: {
        name: 'generate_explanation_paragraphs',
        schema: {
            type: 'object',
            properties: {
              seo_search: { type: 'string', description: 'If someone is searching for the definition of this word, what are they most likely to search for?' },
              featured_google_snippet: { type: 'string', description: "A very short description for the keyword that is perfectly tailored to be in Google's featured snippet." },
              paragraph_1: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: `Title for paragraph 1 (Should be in the style of 'What does ${keyword} mean?')` },
                  text: { type: 'string', description: 'Text body for paragraph 1' },
                },
                required: ['title', 'text'],
                additionalProperties: false,
              },
              paragraph_2: {
                type: 'object',
                properties: { title: { type: 'string', description: 'Title for paragraph 2' }, text: { type: 'string', description: 'Text body for paragraph 2' } },
                required: ['title', 'text'],
                additionalProperties: false,
              },
              paragraph_3: {
                type: 'object',
                properties: { title: { type: 'string', description: 'Title for paragraph 3' }, text: { type: 'string', description: 'Text body for paragraph 3' } },
                required: ['title', 'text'],
                additionalProperties: false,
              },
              synonyms: { type: 'array', items: { type: 'string' }, description: 'List of synonyms for the keyword' },
              antonyms: { type: 'array', items: { type: 'string' }, description: 'List of antonyms for the keyword' },
              usage_examples: { type: 'array', items: { type: 'string' }, description: 'List of usage examples for the keyword' },
              related_keywords: { type: 'array', items: { type: 'string' }, description: 'List of related keywords' },
              meta_description: { type: 'string', description: 'A meta description for the keyword' },
              seo_title: { type: 'string', description: 'The SEO title for search results.' },
              faqs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { question: { type: 'string' }, answer: { type: 'string' } },
                  required: ['question', 'answer'],
                  additionalProperties: false,
                },
                description: 'List of FAQs with questions and answers',
              },
            },
          required: ['seo_search', 'featured_google_snippet', 'paragraph_1', 'paragraph_2', 'paragraph_3', 'synonyms', 'antonyms', 'usage_examples', 'related_keywords', 'meta_description', 'seo_title', 'faqs'],
          additionalProperties: false,
        },
      },
    });

    if (!json) throw new Error('generate-explanation: no JSON returned');
    return json;
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
