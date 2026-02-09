import { BLOCK_SCHEMAS } from '@/server/ai/constants/block-schemas';
import { toStrictSchema } from '@/server/ai/utils';

export function generateElementFunctionParameters(elementType: string, count = 1): Record<string, unknown> {
  const blockSchema = (BLOCK_SCHEMAS as Record<string, unknown>)[elementType] ?? {};

  if (count === 1) {
    return toStrictSchema({
      type: 'object',
      properties: {
        block: {
          type: 'object',
          properties: { content: blockSchema },
          required: ['content'],
        },
      },
      required: ['block'],
    });
  }

  return toStrictSchema({
    type: 'object',
    properties: {
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          properties: { content: blockSchema },
          required: ['content'],
        },
        minItems: count,
        maxItems: count,
      },
    },
    required: ['blocks'],
  });
}

export function generateBlogFunctionParameters(structureInput: string): Record<string, unknown> {
  const structureData = JSON.parse(structureInput) as { blocks: Array<Record<string, unknown>> };

  const specialBlocks = [
    { type: 'meta_description', order: 0, description: 'Short summary of the blog post for SEO purposes.' },
    {
      type: 'excerpt',
      order: 1,
      description: "Brief excerpt or summary of the blog post to capture readers' attention.",
    },
    { type: 'cover_image', order: 2, description: 'Cover image for the blog post.' },
  ];

  const allBlocks = [...specialBlocks, ...structureData.blocks];

  const blockProperties: Record<string, any> = {};
  const requiredKeys: string[] = [];
  let blockOrder = 1;

  for (const block of allBlocks) {
    const blockType = String(block.type);
    if (blockType in BLOCK_SCHEMAS) {
      const blockSchema = { ...(BLOCK_SCHEMAS as Record<string, any>)[blockType] };
      blockSchema.description = block.description;
      if ('requirements' in block) blockSchema.requirements = block.requirements;
      const key = `${blockType}_${blockOrder}`;
      blockProperties[key] = blockSchema;
      requiredKeys.push(key);
      blockOrder += 1;
    }
  }

  return toStrictSchema({
    type: 'object',
    properties: {
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          properties: blockProperties,
          required: requiredKeys,
        },
      },
    },
    required: ['blocks'],
  });
}
