import { WordPriority } from '@prisma/client'
import { z } from 'zod'

const jsonArray = z.array(z.string())

export const createDictionarySchema = z.object({
  title: z.string().min(1).max(255),
  subject: z.string().min(1).max(255),
  language: z.string().min(1).max(20),
  num_words: z.number().int().min(0).default(0),
  current_letter: z.string().min(1).max(3).optional(),
  faqs: jsonArray.optional(),
  slug: z.string().min(1).max(255).optional(),
})

export const updateDictionarySchema = createDictionarySchema.partial()

export const definitionSchema = z.object({
  title: z.string().min(1),
  seo_title: z.string().optional(),
  featured_google_snippet: z.string().min(1),
  meta_description: z.string().min(1),
  title1: z.string().min(1),
  text1: z.string().min(1),
  title2: z.string().min(1),
  text2: z.string().min(1),
  title3: z.string().min(1),
  text3: z.string().min(1),
  synonyms: jsonArray.optional(),
  antonyms: jsonArray.optional(),
  usage_examples: jsonArray.optional(),
  related_keywords: jsonArray.optional(),
  faqs: jsonArray.optional(),
})

export const createWordSchema = z.object({
  dictionaryId: z.number().int().positive(),
  letter: z.string().min(1).max(3),
  keyword: z.string().min(1),
  description: z.string().min(1),
  priority: z.nativeEnum(WordPriority).optional(),
  focus_keyword: z.string().optional(),
  definition: definitionSchema.optional(),
})

export const updateWordSchema = createWordSchema.partial().extend({
  dictionaryId: z.number().int().positive(),
})

export const deleteWordsSchema = z.object({
  dictionaryId: z.number().int().positive(),
  ids: z.array(z.number().int().positive()).min(1),
})

export type ModifyDictionaryInput = z.infer<typeof updateDictionarySchema>
export type ModifyWordInput = z.infer<typeof updateWordSchema>
export type DeleteWordsInput = z.infer<typeof deleteWordsSchema>
