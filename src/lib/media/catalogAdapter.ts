/**
 * Converts the static media-catalog.csv into MediaSource[] for the matching engine.
 *
 * The CSV carries simplified editorial metadata (lean as text, policy_depth_score 1–5,
 * dimension_coverage_notes as slash-separated axis names). Full axis placements will
 * come from the classification pipeline (Stage 3) once run against catalog sources.
 *
 * For the v1 MVP, axis placements are approximated from the lean field so the engine
 * produces meaningful tier splits rather than empty tiers. These approximations are
 * clearly marked and will be overwritten by actual pipeline output.
 */

import type { MediaSource } from '@/lib/engine/mediaMatch'
import type { AxisPlacement, Dimension } from '@/lib/engine/match'
import { ALL_DIMENSIONS } from '@/lib/engine/match'

// ── Lean → coarse axis placement approximation ────────────────────────────────
// Key axes for political lean:
//   markets_governance: left→governance(low), right→markets(high)
//   individual_collective: left→collective(low), right→individual(high)
// Confidence 0.55–0.65 signals "coarse approximation, not pipeline-verified".

function makeAxis(score: number, confidence: number): AxisPlacement {
  return { score, confidence, rationale: 'Coarse lean approximation — pending classification pipeline', sources: [] }
}

function leanToAxisPlacement(lean: string): Partial<Record<Dimension, AxisPlacement>> {
  const l = lean.toLowerCase()
  if (/left.populist/.test(l)) {
    return {
      markets_governance:    makeAxis(12, 0.65),
      individual_collective: makeAxis(20, 0.60),
    }
  }
  if (/\bleft\b/.test(l) && !/center/.test(l)) {
    return {
      markets_governance:    makeAxis(22, 0.60),
      individual_collective: makeAxis(28, 0.55),
      pragmatism_idealism:   makeAxis(68, 0.45),
    }
  }
  if (/center.left/.test(l)) {
    return {
      markets_governance:    makeAxis(38, 0.50),
      individual_collective: makeAxis(40, 0.45),
    }
  }
  if (/center.right/.test(l)) {
    return {
      markets_governance:    makeAxis(62, 0.50),
      individual_collective: makeAxis(60, 0.45),
    }
  }
  if (/\bright\b/.test(l) && !/center/.test(l)) {
    return {
      markets_governance:    makeAxis(78, 0.60),
      individual_collective: makeAxis(72, 0.55),
      pragmatism_idealism:   makeAxis(32, 0.45),
    }
  }
  if (/heterodox/.test(l)) {
    return {
      trust_skepticism: makeAxis(78, 0.50),
    }
  }
  // center / nonpartisan — no strong placement; engine scores will be near-zero
  return {}
}

// ── Partisan-lean flag helper ─────────────────────────────────────────────────

function coarseLeanIsPartisan(cl: MediaSource['coarseLean']): boolean {
  return cl !== 'center' && cl !== 'heterodox'
}

// ── Lean string → MediaSource.coarseLean ─────────────────────────────────────

type CoarseLean = MediaSource['coarseLean']

function normalizeCoarseLean(lean: string): CoarseLean {
  const l = lean.toLowerCase()
  if (/left.populist/.test(l) || (/\bleft\b/.test(l) && !/center/.test(l))) return 'left'
  if (/center.left/.test(l) || /left.libertarian/.test(l)) return 'lean-left'
  if (/center.right/.test(l)) return 'lean-right'
  if (/\bright\b/.test(l) && !/center/.test(l)) return 'right'
  if (/heterodox/.test(l)) return 'heterodox'
  return 'center'
}

// ── Format string → kind + formats ───────────────────────────────────────────

type Kind = MediaSource['kind']
type Format = MediaSource['formats'][number]

function parseFormats(formatStr: string): { kind: Kind; formats: Format[] } {
  const parts = formatStr.toLowerCase().split(/\+|,/).map((s) => s.trim())
  const formats: Format[] = []
  let kind: Kind = 'newsletter'

  for (const p of parts) {
    if (p.includes('podcast')) { formats.push('podcast'); kind = 'podcast' }
    else if (p.includes('video') || p.includes('youtube')) { formats.push('video'); kind = 'youtube' }
    else if (p.includes('newsletter') || p.includes('substack')) { formats.push('newsletter') }
    else if (p.includes('long') || p.includes('writing') || p.includes('essay')) { formats.push('long-form-writing') }
    else if (p.includes('daily') || p.includes('news')) { formats.push('daily-news') }
  }

  if (formats.length === 0) formats.push('newsletter')

  // Override kind to newsletter if newsletter appears first and no podcast/video
  const hasNewsletterFirst = parts[0]?.includes('newsletter') || parts[0]?.includes('substack')
  if (hasNewsletterFirst && !formats.includes('podcast') && !formats.includes('video')) {
    kind = 'newsletter'
  }

  return { kind, formats }
}

// ── dimension_coverage_notes → dimensionCoverage ─────────────────────────────

function parseDimensionCoverage(notes: string): Partial<Record<Dimension, 'signature' | 'regular' | 'incidental'>> {
  const result: Partial<Record<Dimension, 'signature' | 'regular' | 'incidental'>> = {}
  const axisList = notes.split(/\/|,/).map((s) => s.trim().toLowerCase().replace(/ /g, '_'))
  for (const axis of axisList) {
    if (ALL_DIMENSIONS.includes(axis as Dimension)) {
      // First axis listed is treated as 'signature'; rest 'regular'
      const level = axisList.indexOf(axis) === 0 ? 'signature' : 'regular'
      result[axis as Dimension] = level
    }
  }
  return result
}

// ── independence_risk → reliability + goodFaith + independence number ─────────

function riskToScores(risk: string): { goodFaith: MediaSource['goodFaith']; independenceScore: number } {
  const r = risk.toLowerCase()
  if (r.includes('low')) return { goodFaith: 'high', independenceScore: 85 }
  if (r.includes('medium')) return { goodFaith: 'mixed', independenceScore: 60 }
  return { goodFaith: 'low', independenceScore: 35 }
}

// ── flags column → MediaSource.flags ─────────────────────────────────────────

function parseFlags(flagStr: string): MediaSource['flags'] {
  if (flagStr.includes('[R]')) return ['questionable_reliability']
  return []
}

// ── Derive stable id from URL ─────────────────────────────────────────────────

function urlToId(url: string): string {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return hostname.replace(/^www\./, '').replace(/\./g, '_').replace(/[^a-z0-9_]/g, '')
  } catch {
    return url.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)
  }
}

// ── DB-sourced catalog ────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'

export async function loadApprovedSources(): Promise<MediaSource[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('classified_sources')
      .select('*')
      .eq('status', 'approved')
      .not('axis_placement', 'is', null)

    if (error || !data || data.length === 0) {
      console.warn('loadApprovedSources: DB returned no rows, falling back to static CSV')
      return []
    }

    // Filter out seed/placeholder rows that snuck into the DB
    const realRows = data.filter(
      (row) => row.name && row.name !== 'catalog_seed' && row.url && row.url.includes('.')
    )
    if (realRows.length === 0) {
      console.warn('loadApprovedSources: all DB rows look like placeholders, falling back to CSV')
      return []
    }

    return realRows.map((row) => {
      const axisPlacement = (row.axis_placement ?? {}) as Partial<Record<Dimension, AxisPlacement>>
      const { kind, formats } = parseFormats(row.format ?? '')
      const depthScore = row.policy_depth_score ?? 3
      const effort: MediaSource['effort'] = depthScore >= 4 ? 'deep' : depthScore >= 2 ? 'medium' : 'light'

      return {
        id: urlToId(row.url),
        name: row.name,
        kind,
        formats,
        url: row.url,
        independent: true,
        active: 'active',
        axisPlacement,
        coarseLean: (row.coarse_lean ?? 'center') as MediaSource['coarseLean'],
        reliability: row.reliability ?? 60,
        independence: row.independence ?? 70,
        goodFaith: (row.good_faith ?? 'mixed') as MediaSource['goodFaith'],
        transparency: 70,
        dimensionCoverage: {},
        topics: Array.isArray(row.topics) ? row.topics : [],
        effort,
        flags: coarseLeanIsPartisan((row.coarse_lean ?? 'center') as MediaSource['coarseLean']) ? ['partisan_lean'] : [],
        biasRatingSource: 'bedrock_originated',
        externalRefs: row.external_refs ?? {},
        lastReviewed: row.updated_at ? (row.updated_at as string).split('T')[0] : '2026-06-29',
        methodologyVersion: row.methodology_version ?? 'v1',
        attribution: (row.attribution && row.attribution !== 'catalog_seed') ? row.attribution : row.name,
      } satisfies MediaSource
    })
  } catch (err) {
    console.warn('loadApprovedSources: exception, falling back to static CSV:', err)
    return []
  }
}

// ── Word-boundary trim ────────────────────────────────────────────────────────

function wordTrim(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.lastIndexOf(' ', max)
  return cut > 0 ? s.slice(0, cut) : s.slice(0, max)
}

// ── Main adapter ──────────────────────────────────────────────────────────────

export interface CatalogRow {
  name: string
  creators_hosts: string
  format: string
  lean: string
  notable_for: string
  url: string
  access_model: string
  ownership: string
  independence_risk: string
  policy_depth_score: string
  flags: string
  tier_potential: string
  dimension_coverage_notes: string
}

export function adaptCatalogRow(row: CatalogRow): MediaSource {
  const { kind, formats } = parseFormats(row.format)
  const { goodFaith, independenceScore } = riskToScores(row.independence_risk)
  const policyDepth = parseInt(row.policy_depth_score, 10) || 3
  // policy_depth_score 1–5 → reliability 40–80; baseline 60 for unknown
  const reliability = Math.min(100, Math.max(0, (policyDepth / 5) * 80 + 20))
  // Effort: depth 4–5 = deep; 2–3 = medium; 1 = light
  const effort: MediaSource['effort'] = policyDepth >= 4 ? 'deep' : policyDepth >= 2 ? 'medium' : 'light'
  const coarseLean = normalizeCoarseLean(row.lean)

  return {
    id: urlToId(row.url),
    name: row.name.trim(),
    kind,
    formats,
    url: row.url.trim(),
    independent: true,   // all catalog entries meet the independence definition
    active: 'active',
    axisPlacement: leanToAxisPlacement(row.lean),
    coarseLean,
    reliability,
    independence: independenceScore,
    goodFaith,
    transparency: 70,    // default until verified per-source
    dimensionCoverage: parseDimensionCoverage(row.dimension_coverage_notes),
    topics: row.notable_for.split(/[,.;]/).map((s) => s.trim()).filter(Boolean).slice(0, 5),
    effort,
    flags: [
      ...(coarseLeanIsPartisan(coarseLean) ? ['partisan_lean' as const] : []),
      ...parseFlags(row.flags),
    ],
    biasRatingSource: 'bedrock_originated',
    externalRefs: {},
    lastReviewed: '2026-06-29',
    methodologyVersion: 'v1',
    attribution: `${row.creators_hosts} — ${wordTrim(row.notable_for, 80)}`,
  }
}
