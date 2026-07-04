'use server'

// Site-wide config read from the site_config Supabase table (§22c).
// getPillarOneMode() is the only consumer for now; add other keys as needed.
// Cache: 60s in-memory via Next.js unstable_cache. Never throws into a layout —
// any error returns the safe default 'officials'.

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PillarOneMode } from './pillarOne'

const VALID_MODES = new Set<string>(['ballot', 'officials'])

async function _fetchPillarOneMode(): Promise<PillarOneMode> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('site_config')
      .select('value')
      .eq('key', 'pillar_one_mode')
      .single()
    if (error || !data) return 'officials'
    const val = data.value
    return VALID_MODES.has(val) ? (val as PillarOneMode) : 'officials'
  } catch {
    return 'officials'
  }
}

export const getPillarOneMode = unstable_cache(
  _fetchPillarOneMode,
  ['pillar_one_mode'],
  { revalidate: 60 },
)
