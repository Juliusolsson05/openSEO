import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx) => {
  const dictionaryId = Number(ctx.params.dictionaryId)
  const wordId = Number(ctx.params.wordId)
  const word = await dictionaryService.getWord(dictionaryId, wordId, ctx.companyId!)
  if (!word.definition) return raw({ detail: 'Definition not found for the word' }, 404)
  return raw({
    id: word.id,
    letter: word.letter,
    keyword: word.keyword,
    description: word.description,
    priority: word.priority === 'HIGH' ? 1 : 2,
    definition: {
      title: word.definition.title,
      featured_google_snippet: word.definition.featured_google_snippet,
      meta_description: word.definition.meta_description,
      paragraph_1: { title: word.definition.title1, text: word.definition.text1 },
      paragraph_2: { title: word.definition.title2, text: word.definition.text2 },
      paragraph_3: { title: word.definition.title3, text: word.definition.text3 },
      synonyms: word.definition.synonyms,
      antonyms: word.definition.antonyms,
      usage_examples: word.definition.usage_examples,
      related_keywords: word.definition.related_keywords,
      faqs: word.definition.faqs,
    },
  })
})

export const GET = handler
