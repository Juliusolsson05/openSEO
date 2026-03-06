import Anthropic from '@anthropic-ai/sdk'

import { vault } from '@/lib/vault'

let client: Anthropic | null = null
let cachedKey: string | null = null

export async function getAnthropic() {
  const apiKey = await vault.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('Anthropic API key not configured')
  }

  if (!client || cachedKey !== apiKey) {
    client = new Anthropic({ apiKey })
    cachedKey = apiKey
  }

  return client
}
