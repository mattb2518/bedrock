# Bedrock Data Sources Feasibility Report
**Research date:** June 12, 2026
**Suggested repo path:** `docs/data-sources-feasibility-june2026.md`
**Purpose:** Reference document for Claude Code implementation of Pillars 1–3. All findings verified against live pages as of the research date. Marries with SPEC.md when scoring engine and module schemas are built out.

---

## How to use this document

Claude Code should reference this file when:
- Implementing any external data integration for ballot, candidate, officeholder, or media source data
- Setting rate-limit handling, caching TTLs, or retry logic
- Writing license/attribution copy in the UI footer
- Designing schemas for candidates, races, officeholders, or media sources (see §10)
- Planning the build sequence (see §11)

When in doubt about a source's current status, **re-verify** — the civic-data ecosystem is in active flux through 2026.

---

## 1. Executive summary

All three pillars are feasible. The hard problems are concentrated in Pillar 1 (down-ballot candidate data), and they are budget problems, not technical problems. Pillar 2 is more tractable than originally scoped because Ad Fontes is actively rating independent creators. Pillar 3 is the cheapest and most straightforward piece of the build.

**Free/public data sources cover:** federal candidates and officeholders, state legislators, campaign finance, polling locations and election logistics, and statewide ballot measures.

**Licensed sources required for:** comprehensive down-ballot coverage below state-legislative level (school boards, city councils, judges), and curated media-source bias/reliability ratings including independent creators.

---

## 2. Dead APIs — do not reference

Two widely-cited civic data APIs were turned down in 2025. Older civic-tech tutorials and Stack Overflow answers will reference these. They are dead.

### 2.1 Google Civic Information API — Representatives endpoint
- **Status:** Sunset April 30, 2025
- **What it did:** Looked up elected representatives by residential address
- **Replacement path:** Use the new `divisionByAddress` method under the Divisions API to get Open Civic Data Identifiers (OCD-IDs) for an address, then resolve those OCD-IDs against other sources (Ballotpedia, Vote Smart, Open States)
- **Note:** The Elections endpoint (`voterInfoQuery`) is still live and free — covers polling places, drop boxes, sample ballots during election cycles

### 2.2 ProPublica Congress API
- **Status:** No longer available; docs repo archived February 4, 2025; no new API keys being issued
- **What it did:** Members of Congress, bills, votes, nominations, committees, statements
- **Replacement path:** Official congress.gov API (see §3.1)

---

## 3. Pillar 1 — Your Ballot: data sources

### 3.1 congress.gov API (Library of Congress) — PRIMARY FEDERAL

| Attribute | Value |
|---|---|
| Status | Live, v3 stable |
| Base URL | `https://api.congress.gov/v3/` |
| Auth | API key via api.data.gov signup |
| Rate limit | 5,000 requests/hour |
| Cost | Free |
| License | Public domain (US government) |
| Pagination | Default 20 results, max 250 per page |
| Formats | JSON or XML |
| Update frequency | Continuous via Library of Congress feeds |

**Coverage:** Bills, members (current and historical Congress members), votes, committees, amendments, nominations, treaties, congressional records. Replaces ProPublica cleanly for everything except "personal explanation" endpoints (which are gone).

**Implementation notes:**
- Standard auth header pattern: `?api_key={KEY}` query param or header
- Returns include `congress` and `chamber` filters
- Member endpoints support state, district, and current-status filters
- Documentation: `https://github.com/LibraryOfCongress/api.congress.gov/`

### 3.2 FEC openFEC API — PRIMARY CAMPAIGN FINANCE

| Attribute | Value |
|---|---|
| Status | Live, stable |
| Base URL | `https://api.open.fec.gov/v1/` |
| Auth | API key via api.data.gov |
| Rate limit | 1,000 calls/hour standard; 7,200/hour (120/min) on request to APIinfo@fec.gov |
| Cost | Free |
| License | Public domain with restrictions (see below) |
| Pagination | 100 results per page max |
| Formats | JSON |
| Update frequency | Nightly batch updates |

**Coverage:** Federal candidates, committees, contributions, expenditures (including Schedule E independent expenditures), electioneering communications.

**License restrictions:** Contributor lists cannot be used for commercial purposes or to solicit donations. This is fine for Bedrock's read-only display use case but should be noted in the UI attribution.

**Implementation notes:**
- Use `DEMO_KEY` for development; do not deploy without a real key
- The `/candidate/{id}/committees/history` endpoint links candidates to their committees
- Schedule E endpoints surface independent expenditures (early-warning for third-party attacks/support)

### 3.3 Google Civic Information API — Elections + Divisions (Representatives endpoint dead)

| Attribute | Value |
|---|---|
| Status | Elections endpoint live; Representatives endpoint dead since April 2025 |
| Base URL | `https://www.googleapis.com/civicinfo/v2/` |
| Auth | Google Cloud API key |
| Rate limit | 25,000 queries/day |
| Cost | Free |
| License | Google ToS; data sourced from Voting Information Project |
| Update frequency | Tied to state election official partnerships |

**Coverage:**
- `electionQuery` — list of upcoming elections supported by VIP
- `voterInfoQuery` — for a residential address: polling places, early vote locations, drop boxes, contests on the ballot
- `divisionByAddress` (launched September 2024) — returns OCD-IDs for a residential address

**Implementation pattern for Bedrock:** Use `divisionByAddress` as the address-to-OCD-ID resolver, then use the resulting OCD-IDs to look up candidates/officeholders in Open States, Ballotpedia, and Vote Smart.

### 3.4 Open States API v3 (now Plural Open Data) — PRIMARY STATE LEGISLATIVE

| Attribute | Value |
|---|---|
| Status | Live, stable |
| Base URL | `https://v3.openstates.org/` |
| Auth | API key via `X-API-KEY` header or `?apikey=` query param |
| Rate limit | Free tier defaults; paid tiers in development but not formally published |
| Cost | Free for typical use |
| License | Bulk data public domain; attribution requested |
| Formats | JSON |
| Update frequency | Continuous scrapers; bulk data updated regularly |

**Coverage:** All 50 states + DC + Puerto Rico for legislators and bills. Limited experimental municipal coverage. Endpoints include `/people.geo` (legislators by lat/long), `/bills/` (full-text search), `/committees/`, `/events/`.

**Implementation notes:**
- Register at `https://open.pluralpolicy.com/accounts/profile/`
- Bulk downloads available at `https://open.pluralpolicy.com/data/`
- The old GraphQL v2 API is deprecated; do not build against it

### 3.5 Ballotpedia (Geographic API + Bulk Data) — LICENSED, REQUIRED FOR DOWN-BALLOT

| Attribute | Value |
|---|---|
| Status | Live, sales-driven |
| Base URL | Geographic APIs available at `https://developer.ballotpedia.org/` (auth required) |
| Auth | Subscription-issued credentials |
| Cost | Starts at $500; full API access reported in thousands/month range |
| License | Commercial license; no resale or full-set redistribution; value-added product use allowed |
| Contact | data@ballotpedia.org |
| Update frequency | Continuous; candidate lists typically updated within a week of state filing deadline publication |

**Coverage tiers:**
- **Federal and statewide:** All federal and statewide elected offices, with candidate declarations, election results, campaign contact info, voting rules
- **State legislative and top 100 cities:** State legislatures plus elected offices in or overlapping the largest 100 US cities
- **Ultralocal:** Down-ballot candidate lists for 31 states in 2026 — AZ, AR, CA, DE, FL, GA, HI, ID, IL, IN, IA, KY, ME, MI, MN, MT, NV, NM, NC, OH, OK, OR, PA, RI, SC, SD, TX, VA, WA, WI, WY. Covers county-administered elections plus city elections for cities ≥5,000 population. **Does NOT provide election results, vote totals, or persistent person IDs across years for these local offices.**
- **School boards:** ~82,000 members across ~13,000 boards nationwide, reviewed annually
- **Ballot measures:** Statewide measures with descriptions, support/opposition arguments, endorsements, campaign finance

**Coverage gap (states NOT in Ultralocal 2026):** AK, AL, CO, CT, DC, KS, LA, MD, MA, MO, NE, NH, NJ, NY, ND, UT, VT, WV. For these states, only top-100-cities tier coverage is available, meaning many small towns and suburbs have no comprehensive paid source.

**Key license clause:** "Protect the confidentiality of the data to the best of your ability and not make the full set available for others to download or easily scrape. You are free to use the data in a public way as part of a larger, value-added product." Bedrock qualifies as value-added product.

### 3.6 Vote Smart API (Just Facts Vote Smart) — LICENSED

| Attribute | Value |
|---|---|
| Status | Live |
| Base URL | `https://justfacts.votesmart.org/` (data); separate API for licensed access |
| Auth | License-issued credentials |
| Cost | Inquiry-only |
| License | Custom |
| Coverage | Federal + state candidates and officeholders: biographical info, issue positions (Political Courage Test), voting records, campaign finance, interest group ratings, public statements |

**Strategic note:** Vote Smart's Political Courage Test issue positions could be a powerful input to Bedrock's matching engine for candidates who participate (participation is voluntary and incomplete).

### 3.7 Democracy Works Elections API / TurboVote — LIKELY PARTNERSHIP

| Attribute | Value |
|---|---|
| Status | Live, partnership-driven |
| Cost | Enterprise inquiry-only |
| License | Custom |
| Coverage | The "where/when/how" layer: official polling locations, ballot drop boxes, deadlines, registration rules, sample ballot logistics. Data sourced from official government sources via the Voting Information Project. |

**Strategic note:** Democracy Works has explicitly partnered with Anthropic in 2024–2025 to provide authoritative election information for AI products. That makes the Bedrock conversation warmer than a cold pitch to other licensed sources. Their data complements rather than competes with Ballotpedia (logistics vs candidates).

### 3.8 US Vote Foundation Civic Data — LICENSED

| Attribute | Value |
|---|---|
| Status | Live |
| Cost | Licensed |
| Coverage | Election Official Directory (EOD), election dates and deadlines (domestic + overseas), state voting requirements database |

**Strategic note:** Stronger than Democracy Works for overseas/military voter use case (UOCAVA). May be unnecessary if Democracy Works partnership covers logistics.

### 3.9 Down-ballot coverage map (the honest version)

| Race level | Coverage source | Cost |
|---|---|---|
| President, VP | Free (multiple sources) | $0 |
| US Senate, US House | congress.gov, FEC, Vote Smart | $0 |
| Governor, statewide executives | Free + Vote Smart + Ballotpedia federal/statewide tier | $0 base, licensed for full |
| State legislators | Open States, Vote Smart | $0 |
| Mayor, city council (top 100 cities) | Ballotpedia state legislative + top 100 tier | Licensed |
| Mayor, city council (smaller cities, 31 states) | Ballotpedia Ultralocal tier | Licensed (additional) |
| Mayor, city council (smaller cities, 19 states) | **No comprehensive source** | Manual research or scraping required |
| School board members (all states) | Ballotpedia School Boards package | Licensed |
| County offices, judges, special districts | Patchy across all sources | Mostly manual |

### 3.10 Pillar 1 verdict

**Feasible with budget.** Build the federal + state stack now on free APIs. Plan Ballotpedia outreach as a 2026 line item — long lead time is real. If full budget isn't there, launch with explicit scope ("federal + statewide + state legislative + top 100 cities") rather than promising full down-ballot and underdelivering.

---

## 4. Pillar 2 — Your Media Diet: data sources

### 4.1 Ad Fontes Media (Media Bias Chart) — PRIMARY CANDIDATE

| Attribute | Value |
|---|---|
| Status | Live |
| Cost | Inquiry-only (Educator Pro for non-commercial; Data Platform for commercial) |
| License | Tiered commercial license; static chart free for non-commercial display |
| Methodology | Two-dimensional: bias (-42 to +42 horizontal axis) × reliability (0 to 64 vertical axis); human + AI hybrid ratings |
| Contact | info@adfontesmedia.com |

**Critical for Bedrock:** Ad Fontes is actively expanding into independent creator coverage. As of late 2025, they had fully rated articles from 35+ Substacks; 11 appear on the January 2026 flagship chart, including:
- The Parnas Perspective
- To the Contrary by Charlie Sykes
- Racket News (Matt Taibbi)
- The Hartmann Report
- So What by Chris Cillizza
- The Redneck Intellectual (C. Bradley Thompson)
- Big League Politics

Plus a robust podcast chart (48 podcasts in December 2025), including Ezra Klein Show, Joe Rogan Experience, Honestly with Bari Weiss, Pod Save America, and many others across the bias spectrum.

**Important caveat for Bedrock spec:** The independent creators Ad Fontes covers skew toward names with pre-existing platforms (former mainstream-media figures who moved to Substack). Truly grassroots independent creators (smaller Substacks, niche podcasters) are underrepresented in any commercial rating database. This affects matching: Tier 3 ("challenging") sources will be easier to populate than Tier 2 ("expanding") sources for users whose values constellations point toward less-mainstream voices.

### 4.2 AllSides — SECONDARY / CROSS-REFERENCE

| Attribute | Value |
|---|---|
| Status | Live |
| Cost | Free for non-commercial use; commercial license inquiry-only |
| License | CC BY-NC 4.0 for non-commercial with attribution; commercial requires license agreement |
| Methodology | One-dimensional bias rating (Left, Lean Left, Center, Lean Right, Right) using Blind Bias Surveys, Editorial Reviews, third-party data, community feedback |
| Formats | Downloadable CSV/JSON or live API access |
| Coverage | 2,400+ rated media outlets and writers |

**Independent creator coverage:** Limited. Generally rates platforms and outlets, not individual Substack writers. Substack itself is rated "Not Rated." Use as a cross-check on outlet-level bias.

**Bedrock implications:** PBC/nonprofit structure may qualify for CC BY-NC 4.0 free use with attribution — worth confirming in writing. If so, AllSides becomes a free secondary source.

### 4.3 Media Bias/Fact Check (MBFC) — BROADEST DATABASE

| Attribute | Value |
|---|---|
| Status | Live |
| API access | Via RapidAPI; dedicated Business API for enterprise direct access |
| Cost | RapidAPI standard tier pricing; business tier custom quote |
| License | Custom |
| Methodology | Four-category content analysis (wording/headlines, fact-checking/sourcing, story selection, political affiliation) |
| Coverage | 10,000+ sources, journalists, politicians, and countries |
| Contact | editor@mediabiasfactcheck.com |

**Strengths:**
- Broadest coverage including individual journalists
- Includes politician bias/factuality ratings
- Journalist bias section (ad-free membership)
- High agreement with NewsGuard and academic fact-checking datasets

**Weaknesses:**
- Methodology has been academically criticized
- Volunteer-assisted review process
- Use as supplement, not primary

### 4.4 Ground News — NOT A DATA SOURCE FOR BEDROCK

| Attribute | Value |
|---|---|
| Status | Live consumer product |
| API access | No public API; enterprise inquiry only |
| Cost | Consumer subscription ~$10/year |

**Verdict:** Ground News's value is the consumer UX (aggregation across left/center/right for a given story), not data licensing. Do not plan around it.

### 4.5 Three-tier model implementation guidance

The values-to-source matching for Bedrock's three-tier media diet (confirming / expanding / challenging) should use Ad Fontes's two-dimensional model as the primary input. Specifically:

- **Confirming sources:** Match user's values quadrant on bias axis with high reliability (top-right or top-left depending on lean)
- **Expanding sources:** Adjacent quadrants with high reliability
- **Challenging sources:** Opposite-bias quadrant with high reliability — explicitly excluding low-reliability ("Hyper-Partisan" and below) sources to avoid feeding misinformation as "challenge"

The reliability floor matters more than the bias spread. A user's "challenging" sources should never be lower-reliability than their "confirming" sources.

### 4.6 Pillar 2 verdict

**Feasible and faster than Pillar 1.** Ad Fontes Data Platform is the most likely primary partner. AllSides CC BY-NC 4.0 may cover the free secondary tier if Bedrock's PBC structure qualifies as non-commercial. MBFC via RapidAPI as a third reference. Methodology integrity is the real consideration — combining AllSides one-dimensional with Ad Fontes two-dimensional naively will produce nonsense. Pick one as primary.

---

## 5. Pillar 3 — Your Conversations: LLM infrastructure

### 5.1 Model selection

| Model | Input $/MTok | Output $/MTok | Context | Use case |
|---|---|---|---|---|
| Claude Sonnet 4.6 | $3.00 | $15.00 | 1M tokens at standard pricing | **Default production model for user conversations** |
| Claude Haiku 4.5 | $1.00 | $5.00 | 200K | Classification, routing, summarization, simple turns |
| Claude Opus 4.7 | $5.00 | $25.00 | 1M | Reserve for design-time work (recommendation engine, bias audits) |
| Claude Opus 4.8 | $5.00 | $25.00 | 1M (Fast Mode $10/$50) | Newest; same base price as Opus 4.7, faster Fast Mode |

### 5.2 Prompt caching — the unlock for values-profile-as-context

The persistent values profile pattern is what makes Bedrock distinctive. Prompt caching makes it economically viable.

- **Cache hit reads:** 0.1x base input rate (90% savings on cached tokens)
- **5-minute TTL write:** 1.25x base input rate
- **1-hour TTL write:** 2x base input rate

**Implementation pattern:**
1. Encode the user's eight-dimension values profile + relevant memory + system instructions into a cacheable system prompt
2. Use 5-minute TTL for active conversations
3. Use 1-hour TTL for users likely to return within the hour
4. Re-warm the cache on session start with a no-op turn if needed

### 5.3 Cost posture — back-of-envelope

Per-turn cost estimate for typical Bedrock conversation on Sonnet 4.6 with caching:
- 2,000 cached system tokens (values profile + context) × $0.30/M = $0.0006
- 500 fresh input tokens × $3/M = $0.0015
- 600 output tokens × $15/M = $0.009
- **Total: ~$0.011 per turn**

At 30 turns/user/month: $0.33/user/month
At 10,000 active monthly users × 30 turns: ~$3,300/month at full Sonnet

Batch API (50% off) for any non-realtime workloads. Haiku routing for simple turns. Both can cut the bill further.

### 5.4 Pillar 3 verdict

**Feasible and inexpensive.** Sonnet 4.6 + prompt caching is the right default. Reserve Opus 4.7/4.8 for design-time analytical work. Real challenge is prompt design — encoding the values profile so it shapes responses without producing sycophancy or perceived partisanship — not infrastructure.

---

## 6. Cross-cutting concerns

### 6.1 Attribution requirements

UI footer should accommodate attribution strings for:
- congress.gov: "Data from Library of Congress, congress.gov"
- FEC: "Campaign finance data from the Federal Election Commission"
- Open States / Plural: "State legislative data from Open States / Plural Open Data"
- Google Civic: per Google Maps Platform attribution guidelines
- AllSides (if CC BY-NC): "Media bias ratings © AllSides, used under CC BY-NC 4.0"
- Ad Fontes: per commercial license terms
- MBFC: per commercial license terms
- Ballotpedia: per commercial license terms
- Democracy Works: per partnership terms

Schema needs a `source_attribution` field on every entity displayed to users.

### 6.2 Rate limit handling

Conservative defaults for the free APIs:

| Source | Recommended client throttle |
|---|---|
| congress.gov | 1 req/sec (well under 5,000/hr limit) |
| FEC | 1 req/4 sec (well under 1,000/hr limit) |
| Open States | 1 req/sec |
| Google Civic | Batch where possible to stay under 25K/day |

All clients should implement exponential backoff on 429 responses and HTML CAPTCHA responses (loc.gov pattern).

### 6.3 Caching TTLs (data freshness)

| Data type | Recommended TTL |
|---|---|
| Member of Congress profiles | 24 hours |
| Bills and votes | 6 hours |
| Campaign finance summaries | 24 hours |
| Polling locations during active election | 1 hour |
| Polling locations off-cycle | 7 days |
| Ballotpedia candidate data | 24 hours (refresh within candidate filing deadline + 1 week) |
| Ad Fontes / AllSides bias ratings | 7 days |
| Election dates and deadlines | 24 hours |

### 6.4 Token / credential handling

**Never put tokens in:**
- Repository content (including `.env.example` if it contains real values)
- Chat messages or prompts
- Documentation files
- Spec files

**Always put tokens in:**
- Environment variables loaded from a secret manager
- Build-time secrets in the deployment platform
- A local `.env` file that is gitignored

---

## 7. Outreach priority order

Three conversations to start, ordered by lead time:

1. **Ballotpedia** (data@ballotpedia.org) — longest lead time, biggest budget impact, most coverage at stake. Request rate card immediately. Frame Bedrock as a PBC/nonprofit value-added product.

2. **Ad Fontes Media** (info@adfontesmedia.com) — Data Platform pricing. Frame the independent creator focus as a use case match. Ask about non-commercial educator pricing if PBC status qualifies.

3. **Democracy Works** — warmest conversation given the Anthropic partnership. Frame Bedrock as complementary to Ballotpedia, focused on the values-matching layer that DW does not provide. May get partnership-level rather than commercial pricing.

Deferred until Pillar 2 is fully specced:
- AllSides commercial / non-commercial license clarification
- MBFC business API quote
- Vote Smart licensing

---

## 8. SPEC.md updates needed

The following updates should be applied to SPEC.md and `docs/brand-guidelines.md` if relevant:

### Tech stack section
- Change "Google Civic Information API" to "Google Civic Information API (Elections + Divisions endpoints only — Representatives endpoint sunset April 2025)"
- Remove any reference to ProPublica Congress API; replace with "congress.gov API (Library of Congress)"
- Update "Open States API" to "Open States API v3 (Plural Open Data)"

### Data sources section — split into two tiers

**Free / public domain (no licensing required):**
- congress.gov API (federal legislative)
- FEC openFEC API (federal campaign finance)
- Open States v3 / Plural Open Data (state legislative)
- Google Civic Information API — Elections and Divisions endpoints (address-to-OCD-ID resolution, polling places)
- US Vote Foundation EOD (jurisdiction directory)

**Licensed (outreach required before launch):**
- Ballotpedia — Ultralocal, School Boards, Sample Ballot Lookup
- Ad Fontes Media — Data Platform (media bias ratings)
- AllSides (commercial license, or confirm CC BY-NC eligibility)
- MBFC (RapidAPI or Business tier)
- Vote Smart (issue positions and Political Courage Test, where participating)
- Democracy Works Elections API (logistics and sample ballots)

### Architecture note
Address-to-ballot resolution should follow this pattern:
1. User enters address
2. Google Civic `divisionByAddress` → returns list of OCD-IDs
3. For each OCD-ID: query Ballotpedia, Open States, congress.gov, Vote Smart as appropriate to the jurisdiction level
4. Render unified ballot with attribution per source

---

## 9. Schema implications

The following fields should exist on Bedrock data models when Claude Code builds them out. This is a starting checklist, not a complete schema spec.

### Candidate / Officeholder
- `external_ids` — map of source → ID (ballotpedia_id, votesmart_id, fec_candidate_id, ocd_id, etc.)
- `source_attribution` — which source(s) this record was assembled from
- `last_updated_from_source` — for cache invalidation
- `coverage_tier` — federal | statewide | state_legislative | top_100_city | ultralocal | school_board (signals data confidence and source)
- `office_ocd_id` — Open Civic Data Identifier for the office, used for cross-source joins
- `issue_positions` — when available from Vote Smart Political Courage Test
- `committee_affiliations` — for federal/state legislators
- `campaign_finance_summary` — derived from FEC openFEC

### Race / Contest
- `ocd_division_id`
- `election_date`
- `office_type`
- `jurisdiction_level` — federal | state | county | municipal | school_district | special_district
- `candidates[]`
- `data_completeness` — flag for races where Bedrock has partial data (e.g., names but no positions)
- `attribution_sources[]`

### Media Source
- `name`
- `url`
- `source_type` — outlet | podcast | substack | journalist
- `bias_rating` — Ad Fontes two-dimensional (bias_score, reliability_score) as primary
- `bias_rating_alt` — AllSides one-dimensional as secondary
- `mbfc_rating` — optional tertiary
- `tier_eligibility` — confirming | expanding | challenging | excluded (driven by reliability floor)
- `topical_focus[]` — what subjects this source covers
- `attribution_string` — per license terms

### User Values Profile (for Pillar 3 context)
- `dimensions` — eight-dimension scores from quiz
- `dimensional_constellation` — derived archetype
- `cached_system_prompt_hash` — for prompt caching key
- `cache_warm_until` — TTL marker

### Conversation
- `user_id`
- `values_profile_snapshot` — reference, not copy (caches against snapshot)
- `turn_count`
- `model_used` — for cost tracking and routing decisions

---

## 10. Recommended build sequence

For Claude Code, in order of dependency:

### Phase 1 — Free-tier foundation (no external blockers)
1. **Federal layer:** congress.gov + FEC clients with rate limiting, caching, and retry
2. **State layer:** Open States v3 client
3. **Address resolution:** Google Civic Divisions API client
4. **Ballot assembly logic:** combine OCD-IDs → candidates from federal + state sources
5. **Attribution rendering:** UI components that surface source citations per displayed entity
6. **Pillar 3 plumbing:** Sonnet 4.6 + prompt caching scaffolding for values-profile-as-context

### Phase 2 — Pillar 2 (parallel to Phase 1, depends on outreach)
1. Decide primary (likely Ad Fontes)
2. Implement bias rating ingestion (CSV/JSON file feed if available, API if licensed)
3. Build three-tier matching algorithm against user values profile
4. Render media diet with reliability floor enforcement

### Phase 3 — Down-ballot expansion (depends on Ballotpedia outreach)
1. Ballotpedia Geographic API client
2. Ultralocal coverage for the 31 supported states
3. School board layer (separate package)
4. Sample Ballot Lookup integration (if licensing the SBLT instead of building)

### Phase 4 — Polish and partnership integrations
1. Democracy Works integration for polling logistics
2. Vote Smart issue positions where candidate participated
3. Local race coverage fallback strategy for the 19 non-Ultralocal states

---

## 11. Open questions for future sessions

These need to be addressed in this Claude Project (spec/design space), not by Claude Code:

- **Recommendation engine matching formula** (flagged for Opus session) — how to weight the eight dimensions against candidate positions and against media source ratings
- **Down-ballot coverage strategy for the 19 non-Ultralocal states** — accept partial coverage, build a scraping layer, or partner with a state-level civic-tech organization
- **AllSides vs Ad Fontes primary choice** — methodology decision with downstream implications
- **PBC nonprofit status confirmation for non-commercial licensing eligibility** — legal question that affects budget materially
- **Vote Smart Political Courage Test integration** — participation is voluntary and incomplete; how to handle non-participating candidates without disadvantaging them in matching
- **Caching strategy for high-volume election days** — surge-handling beyond default TTLs

---

## 12. Citation references

Sources verified live as of June 12, 2026:

- congress.gov API: `https://api.congress.gov/` and `https://github.com/LibraryOfCongress/api.congress.gov/`
- FEC openFEC: `https://api.open.fec.gov/developers/`
- Google Civic Information API turndown: official Google Groups announcement and developer docs
- ProPublica Congress API archive: `https://github.com/propublica/congress-api-docs` (archived Feb 4, 2025)
- Open States v3: `https://docs.openstates.org/api-v3/`
- Ballotpedia: `https://ballotpedia.org/Ballotpedia:Buy_Political_Data` and `https://developer.ballotpedia.org/`
- Vote Smart: `https://justfacts.votesmart.org/` and `https://votesmart.org/share/api`
- Democracy Works: `https://www.democracy.works/elections-api` and `https://www.democracy.works/about`
- AllSides: `https://www.allsides.com/about/media-bias-rating-methods` and AllSides Services Sheet
- Ad Fontes: `https://adfontesmedia.com/pricing-services/` and `https://adfontesmedia.com/data-platform/`
- Ad Fontes Substack coverage: `https://adfontesmedia.com/substack-popular-publisher-web-chart-dec2025/` and `https://adfontesmedia.com/flagship-media-bias-chart-jan2026/`
- MBFC API: `https://mediabiasfactcheck.com/mbfcs-data-api/`
- Ground News: `https://ground.news/subscribe` and chriscasarez.com analysis
- Claude API pricing: verified against multiple 2026 industry reports cross-referenced with Anthropic documentation

---

*End of document.*
