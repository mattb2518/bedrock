'use server'

import { NextRequest, NextResponse } from 'next/server'
import { classifyArticle } from '@/lib/classification/classifyArticle'
import { lookupCatalog } from '@/lib/media/catalogLookup'
import type { DimensionalProfile } from '@/lib/engine/match'
import { createClient } from '@/lib/supabase/server'
import { aj } from '@/lib/arcjet'

// POST /api/bias-checker
// Article text is NEVER persisted here or in classifyArticle (§24b.5).
// No DB writes anywhere in this flow.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const decision = await aj.protect(req, { requested: 1 })
  if (decision.isDenied()) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: {
    url?: string
    pastedText?: string
    pdfBase64?: string
    userProfile?: DimensionalProfile
    primaryType?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { url, pastedText, pdfBase64, userProfile, primaryType } = body

  if (!url && !pastedText && !pdfBase64) {
    return NextResponse.json({ error: 'No content provided' }, { status: 400 })
  }

  // If no profile, use a neutral flat profile and flag it so the client omits
  // the profile-read section rather than showing a fabricated result.
  const profileAvailable = Boolean(userProfile && primaryType)
  const effectiveProfile: DimensionalProfile = userProfile ?? {
    stability_change:      50,
    local_federal:         50,
    national_global:       50,
    rules_outcomes:        50,
    markets_governance:    50,
    pragmatism_idealism:   50,
    individual_collective: 50,
    trust_skepticism:      50,
  }

  const analysis = await classifyArticle({
    url,
    pastedText,
    pdfBase64,
    userProfile: effectiveProfile,
    primaryType: primaryType ?? 'unknown',
  })

  if (!analysis.ok) {
    return NextResponse.json({ ok: false, failure: analysis.failure })
  }

  // Catalog lookup — enrich reliability signal if the source URL is known.
  // classifyArticle always returns inCatalog: false; we resolve it here against
  // the static CSV so that logic stays out of the pure classification function.
  const sourceUrl = analysis.result.sourceUrl ?? url
  const catalogResult = sourceUrl ? lookupCatalog(sourceUrl) : { inCatalog: false as const }

  const enrichedResult = {
    ...analysis.result,
    reliabilitySignal: {
      ...analysis.result.reliabilitySignal,
      inCatalog: catalogResult.inCatalog,
      catalogName:  catalogResult.inCatalog ? catalogResult.name  : undefined,
      catalogLean:  catalogResult.inCatalog ? catalogResult.lean  : undefined,
      catalogFlags: catalogResult.inCatalog ? catalogResult.flags : undefined,
    },
    profileAvailable,
  }

  return NextResponse.json({ ok: true, result: enrichedResult })
}
