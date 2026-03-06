import { GoogleGenAI } from '@google/genai'

import { vault } from '@/lib/vault'

let client: GoogleGenAI | null = null
let cachedKey: string | null = null

export async function getGemini() {
  const apiKey = await vault.get('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  if (!client || cachedKey !== apiKey) {
    client = new GoogleGenAI({ apiKey })
    cachedKey = apiKey
  }

  return client
}
