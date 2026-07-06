// Server-side proxy for Google Places Autocomplete (New).
// Keeps GOOGLE_PLACES_API_KEY server-only; client never sees the key.
// §22d.2: US-restricted, address-type predictions, no Place Details calls.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLACES_URL = 'https://places.googleapis.com/v1/places:autocomplete'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Places API not configured' }, { status: 503 })
  }

  let input: string
  try {
    const body = await req.json()
    input = String(body.input ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (input.length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  const body = {
    input,
    includedRegionCodes: ['us'],
    includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
  }

  try {
    const res = await fetch(PLACES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.text.text',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Places API error', res.status, err)
      return NextResponse.json({ error: 'upstream', status: res.status }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ suggestions: data.suggestions ?? [] })
  } catch (err) {
    console.error('Places API fetch error', err)
    return NextResponse.json({ error: 'upstream', status: 500 }, { status: 502 })
  }
}
