// Download Wikipedia forebear portraits for each Civic Mantle.
// SPEC §4 Forebear Imagery + C8.
// Run: node scripts/download-forebears.mjs

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'forebears')

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const MANTLES = [
  { slug: 'honest_broker',   wikiTitle: 'George_Washington' },
  { slug: 'system_fixer',    wikiTitle: 'Theodore_Roosevelt' },
  { slug: 'long_gamer',      wikiTitle: 'Benjamin_Franklin' },
  { slug: 'good_neighbor',   wikiTitle: 'Jane_Addams' },
  { slug: 'missourian',      wikiTitle: 'Harry_S._Truman' },
  { slug: 'eternal_optimist',wikiTitle: 'Walt_Whitman' },
  { slug: 'steward',         wikiTitle: 'Dwight_D._Eisenhower' },
  { slug: 'free_agent',      wikiTitle: 'Mark_Twain' },
  { slug: 'standard_bearer', wikiTitle: 'Abraham_Lincoln' },
  { slug: 'pioneer',         wikiTitle: 'Alexander_Hamilton' },
]

async function fetchImageUrl(wikiTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'BedrockApp/1.0 (bedrock.guide)' } })
  if (!res.ok) throw new Error(`Wikipedia API error for ${wikiTitle}: ${res.status}`)
  const data = await res.json()
  const imgUrl = data.originalimage?.source ?? data.thumbnail?.source
  if (!imgUrl) throw new Error(`No image found for ${wikiTitle}`)
  return imgUrl
}

async function downloadImage(url, outPath) {
  const res = await fetch(url, { headers: { 'User-Agent': 'BedrockApp/1.0 (bedrock.guide)' } })
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(outPath, buffer)
  return buffer.length
}

for (const { slug, wikiTitle } of MANTLES) {
  const outPath = join(OUT_DIR, `${slug}.jpg`)
  try {
    process.stdout.write(`Fetching ${wikiTitle}... `)
    const imgUrl = await fetchImageUrl(wikiTitle)
    const bytes = await downloadImage(imgUrl, outPath)
    console.log(`OK (${Math.round(bytes / 1024)} KB) → public/forebears/${slug}.jpg`)
  } catch (err) {
    console.error(`FAILED: ${err.message}`)
  }
}

console.log('\nDone. Check public/forebears/ for all ten files.')
