/**
 * GET /api/example/dictionary/:wordId
 *
 * Returns a single dictionary word by ID.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWord } from '@/app/example/_lib/data'

type RouteParams = { params: Promise<{ wordId: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { wordId } = await params
  const word = await getWord(wordId)

  if (!word) {
    return NextResponse.json({ error: 'Word not found' }, { status: 404 })
  }

  return NextResponse.json({ word })
}
