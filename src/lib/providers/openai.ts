import OpenAI from 'openai'

import { vault } from '@/lib/vault'

let client: OpenAI | null = null
let cachedKey: string | null = null

export async function getOpenAI() {
  const apiKey = await vault.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  if (!client || cachedKey !== apiKey) {
    client = new OpenAI({ apiKey })
    cachedKey = apiKey
  }

  return client
}
