import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { parseToolArguments } from '@/server/ai/utils';
import { fetchLogoUrl } from '@/server/ai/blog-elements/fetch-logo-url';
import { uploadToCloudinary } from '@/server/ai/blog-elements/upload-to-cloudinary';

export async function generateCaseStudy(blogTitle: string, focusKeyword: string): Promise<Record<string, unknown>> {
  const caseStudySchema = {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'The main title of the case study, highlighting the key achievement.' },
      clientName: { type: 'string', description: 'Name of the company or client featured in the case study.' },
      industry: { type: 'string', description: 'The industry or sector the client operates in.' },
      companyWebsite: { type: 'string', description: 'The official website URL of the featured company.' },
      headerColor: {
        type: 'string',
        description: "Hex color code for the header background (e.g., '#FF7A59' for orange).",
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

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert content creator specializing in crafting detailed and accurate case studies.\nYou are tasked with generating a case study that fits this blog_title and this focus_keyword. The case study MUST be a real case study, you should NOT make up one. So pick a REAL case study and real information. So WHATEVER you do, DO NOT pick some bullshit example name such as XYZ corp, IT SHOULD BE A REAL case study. If it is not a real case study you destroy our company image.',
      },
      { role: 'user', content: `Blog Title: ${blogTitle}\nFocus Keyword: ${focusKeyword}` },
      {
        role: 'system',
        content:
          'Generate the case study content following the provided schema. Ensure all required fields are populated with accurate and real-world information.Make the color match the companies logo',
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_case_study',
          description: 'Generates a case study component showcasing real-world examples of success.',
          parameters: {
            type: 'object',
            properties: {
              block: {
                type: 'object',
                properties: { content: caseStudySchema },
                required: ['content'],
              },
            },
            required: ['block'],
          },
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'generate_case_study' } },
    max_tokens: 1500,
  });

  let content = JSON.parse(parseToolArguments(response)) as any;
  if (content.block?.content) content = content.block.content;

  const companyWebsite = content.companyWebsite;
  if (companyWebsite) {
    const logoUrl = await fetchLogoUrl(companyWebsite);
    if (logoUrl) {
      const cloudinaryUrl = await uploadToCloudinary(logoUrl);
      if (cloudinaryUrl) content.companyLogo = cloudinaryUrl;
    }
  }

  return content;
}
