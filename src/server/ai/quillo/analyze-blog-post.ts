import { BLOCK_SCHEMAS } from '../constants/block-schemas';
import { MODELS } from '../clients';
import { callModel } from '../providers';

import type { ChatMessage } from '@/types/quillo';

export async function analyzeBlogPost(postData: unknown) {
  const systemPrompt = `You are an AI assistant specialized in analyzing and improving blog posts.
        You have deep knowledge of SEO, content writing, and blog structure.
        You understand the following blog element types and their structures:
        ${JSON.stringify(BLOCK_SCHEMAS, null, 2)}

        Analyze the given blog post thoroughly, considering:
        1. SPECIFICITY: Does every paragraph reference specific companies, tools, data, or real outcomes? Generic paragraphs that could apply to any industry score low.
        2. VALUE: Does the reader learn something actionable? Can they DO something after reading this?
        3. INTRO QUALITY: Does the introduction hook with a specific problem, stat, or story? Or does it use the "In this post we'll explore..." anti-pattern?
        4. KEYWORD USAGE: Is the focus keyword used naturally, or is it stuffed into every paragraph?
        5. VOICE: Does it sound like a knowledgeable person wrote it, or like generic AI output?
        6. SEO: Structure, headings, meta description, keyword placement.
        7. FORMATTING: Proper use of br, strong, em tags for readability.

        Scoring framework:
        10-20: Generic AI slop — no specific examples, corporate filler, keyword stuffed
        30-40: Below average — some structure but mostly vague and abstract
        50-60: Average — decent structure, some specifics, but still reads as AI-generated
        70-80: Good — clear voice, specific examples, actionable content
        90-100: Excellent — reads like an expert wrote it, unique insights, highly actionable

        Be direct and honest. Flag every paragraph that lacks specificity.`;

  const userPrompt = `Analyze the following blog post and provide comprehensive improvement suggestions. Be ruthless in your feedback - I appreciate direct, honest criticism: ${JSON.stringify(postData)}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const { json: analysisResult, text, raw } = await callModel<unknown>({
    model: MODELS.OPENAI_DEFAULT,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    jsonSchema: {
      name: 'analyze_blog_post',
      schema: {
        type: 'object',
        properties: {
          overall_analysis: {
            type: 'object',
            properties: {
              overall_score: { type: 'integer' },
              summary: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
            },
            required: ['overall_score', 'summary', 'strengths', 'weaknesses'],
            additionalProperties: false,
          },
          seo_improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                suggestion: { type: 'string' },
                reason: { type: 'string' },
                importance: { type: 'string', enum: ['Low', 'Medium', 'High'] },
              },
              required: ['suggestion', 'reason', 'importance'],
              additionalProperties: false,
            },
          },
          content_improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                element_id: { type: 'integer' },
                element_type: { type: 'string' },
                suggestion: { type: 'string' },
                reason: { type: 'string' },
                proposed_changes: { type: 'string' },
              },
              required: ['element_id', 'element_type', 'suggestion', 'reason', 'proposed_changes'],
              additionalProperties: false,
            },
          },
          structure_improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                suggestion: { type: 'string' },
                reason: { type: 'string' },
                proposed_changes: { type: 'string' },
              },
              required: ['suggestion', 'reason', 'proposed_changes'],
              additionalProperties: false,
            },
          },
          recommended_additions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                element_type: { type: 'string' },
                reason: { type: 'string' },
                proposed_content: { type: 'string' },
              },
              required: ['element_type', 'reason', 'proposed_content'],
              additionalProperties: false,
            },
          },
        },
        required: ['overall_analysis', 'seo_improvements', 'content_improvements', 'structure_improvements', 'recommended_additions'],
        additionalProperties: false,
      },
    },
  });

  // Append the assistant's JSON response to the message history for multi-turn follow-ups.
  messages.push({ role: 'assistant', content: text || JSON.stringify(analysisResult ?? {}) });

  return {
    analysis_result: analysisResult,
    raw_response: raw,
    messages,
  };
}
