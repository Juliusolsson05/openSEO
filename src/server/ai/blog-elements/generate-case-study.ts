import { MODELS } from '@/server/ai/clients';
import { fetchLogoUrl } from '@/server/ai/blog-elements/fetch-logo-url';
import { uploadFromUrl } from '@/server/storage/upload';
import { callModel } from '@/server/ai/providers';

export async function generateCaseStudy(blogTitle: string, focusKeyword: string, companyId?: number): Promise<Record<string, unknown>> {
  const caseStudySchema = {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'The main title of the case study, highlighting the key achievement.' },
      clientName: { type: 'string', description: 'Name of the company or client featured in the case study.' },
      industry: { type: 'string', description: 'The industry or sector the client operates in.' },
      companyWebsite: { type: 'string', description: 'The official website URL of the featured company.' },
      headerColor: {
        type: 'string',
        description: "Hex color code for the header background that matches the company's brand colors.",
      },
      challenge: { type: 'string', description: 'A brief description of the problem or challenge the client faced.' },
      solution: {
        type: 'string',
        description: 'A concise explanation of the solution implemented to address the challenge.',
      },
      results: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of key results or achievements from implementing the solution.',
      },
      testimonial: {
        type: 'object',
        properties: {
          quote: { type: 'string', description: 'A direct quote from the client about the impact of the solution.' },
          author: { type: 'string', description: 'Name and title of the person providing the testimonial.' },
        },
        required: ['quote', 'author'],
        additionalProperties: false,
      },
    },
    required: [
      'title',
      'clientName',
      'industry',
      'companyWebsite',
      'headerColor',
      'challenge',
      'solution',
      'results',
      'testimonial',
    ],
    additionalProperties: false,
  };

  const { json } = await callModel<any>({
    model: MODELS.OPENAI_DEFAULT,
    system: `You are a case study writer. Generate a case study featuring a well-known, verifiable company that is relevant to the blog topic.

Requirements:
- Use a REAL company that readers would recognize — e.g. Slack, HubSpot, Shopify, Stripe, Notion, Airbnb, etc.
- The challenge, solution, and results should be grounded in what this company is publicly known for.
- Include specific numbers in results where possible (percentages, revenue, user counts).
- The testimonial should sound natural, not corporate. Use a real executive name and title if possible.
- Match the header color to the company's actual brand colors.
- Do not use placeholder names like "XYZ Corp" or "Acme Inc."`,
    messages: [
      { role: 'user', content: `Blog Title: ${blogTitle}\nFocus Keyword: ${focusKeyword}\n\nGenerate a relevant case study for this topic.` },
    ],
    jsonSchema: {
      name: 'generate_case_study',
      schema: {
        type: 'object',
        properties: {
          block: {
            type: 'object',
            properties: { content: caseStudySchema },
            required: ['content'],
            additionalProperties: false,
          },
        },
        required: ['block'],
        additionalProperties: false,
      },
    },
  });

  if (!json) throw new Error('generate-case-study: no JSON returned');
  let content = json;
  if (content.block?.content) content = content.block.content;

  const companyWebsite = content.companyWebsite;
  if (companyWebsite) {
    const logoUrl = await fetchLogoUrl(companyWebsite);
    if (logoUrl) {
      const uploadedUrl = await uploadFromUrl(logoUrl, companyId ?? 0, 'logos');
      if (uploadedUrl) content.companyLogo = uploadedUrl;
    }
  }

  return content;
}
