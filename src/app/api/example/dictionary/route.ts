/**
 * GET /api/example/dictionary
 *
 * Returns the full dictionary with all words.
 */

import { NextResponse } from 'next/server'
import { getDictionary } from '@/app/example/_lib/data'

export async function GET() {
  const dictionary = await getDictionary()
  return NextResponse.json({ dictionary })
}
