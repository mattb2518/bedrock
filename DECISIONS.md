# Bedrock — Decisions Log

A running record of product/design decisions and the open questions still on the
table. Lives in the repo so it stays in sync across machines and with the Claude
Project. New decisions get appended; open questions move to **Decided** with a
date when resolved.

How we use it: open questions are surfaced for input in small batches, right
before they would block work — not all at once. The three pillar **design memos**
live in [`research/`](research/); the Claude Project supplies the **factual**
half (APIs, pricing, licensing, coverage). Those facts get folded in per-pillar,
just-in-time, when we start building that pillar.

---

## Decided

| Date | Decision | Notes |
|---|---|---|
| 2026-06-12 | **Quiz data stays browser-only for now.** | localStorage via the quiz store. Real DB persistence (Supabase, keyed to an account) deferred until the quiz is stable and accounts are wired. |
| 2026-06-12 | **Profile/constellation is computed from Layer 1 only.** | Layers 2–4 capture positions, voting behavior, and dealbreakers for the engine and raise completion %, but do not re-plot the constellation. Matches all three research memos (Layer 1 *is* the civic identity). |
| 2026-06-12 | **Dealbreakers (L4) feed Ballot, never Media.** | Filtering media by your hard lines is the echo chamber the product exists to fight (pillar-2 memo). |
| 2026-06-12 | **First pillar to build = Conversations.** | Lowest data risk: needs only Layer 1 + a Claude system prompt; the Project only has to confirm model/pricing. Ballot and Media need heavier factual research + editorial curation. Reinforced by the feasibility doc §5 (cheapest, ~$0.011/turn on Sonnet 4.6 + prompt caching). |
| 2026-06-29 | **Conversations pillar complete — declared ready for user testing.** | All three modes shipped: Openers, Responses, Back-and-forth. Back-and-forth evolved significantly beyond the "Rehearse one" spec stub into a full live practice chat: iMessage-style bubbles, per-turn coaching hints (Decoding this + Try: chips with Add-to-chat), pre-practice coach brief, sensitive-topic guardrail, session restart/home nav, print-to-PDF transcripts with Bedrock.guide branding. SPEC.md §18 needs a Project session update to reflect the shipped design. |
| 2026-06-29 | **Conversations: v1 no save, clean slate.** | Confirmed in build. Each session starts fresh — no history stored. The bottom-of-pillar copy already promises this. True memory (Bedrock recalling a prior conversation) is a deliberate v2 feature. |
| 2026-06-29 | **Conversations: model confirmed as claude-sonnet-4-6 with prompt caching.** | System prompt cached with `cache_control: { type: 'ephemeral' }`. Back-and-forth at ~$0.011/turn as projected. |
| 2026-06-29 | **Conversations: neutrality guardrails confirmed in system prompt.** | No conspiracy theories, no demonstrably false claims, no personal attacks, character never references the practice session. Guardrails are prompt-level, not UI-level. |
| 2026-06-12 | **Authoritative data-source reference: [`docs/data-sources-feasibility-june2026.md`](docs/data-sources-feasibility-june2026.md).** | From the Claude Project, web-verified June 2026. Governs all external-data, scoring, and schema work. **Supersedes SPEC.md's Tech Stack** where they conflict. Read it before any data-integration session (whole doc, or targeted: §3 Ballot sources, §6 cross-cutting, §9 schema, §10 build sequence). |
| 2026-06-12 | **Two APIs in SPEC are dead — do not use.** | Google Civic *Representatives* endpoint sunset Apr 2025 → use `divisionByAddress` + congress.gov/Open States/Ballotpedia. ProPublica Congress API archived Feb 2025 → use congress.gov API. (Feasibility doc §2.) SPEC.md Tech Stack still needs correcting — see §8 of the doc. |
| 2026-06-29 | **Supabase persistence plan approved.** | Single `quiz_profiles` table, automatic conflict resolution (most complete then newest wins), milestone + debounced write cadence, local-first before sign-up. See `docs/supabase-persistence-plan.md`. |
| 2026-06-29 | **Cookie banner: no banner required.** | Strictly necessary auth cookies + cookieless Plausible analytics. Exempt under GDPR and CCPA. Founder decision. Documented in §27. |
| 2026-06-29 | **Rhetoric vs record weighting: 3:1 record over rhetoric.** | When both exist: record 75%, stated position 25%. Challenger with rhetoric only: confidence capped at 0.5 regardless of clarity. See §19. |
| 2026-06-29 | **Dealbreaker evidence standard.** | Triggers exclusion if: public documented statement OR recorded vote OR credible reporting from two or more independent named journalists at high-reliability outlets. Cannot verify → `unknown` status, flagged to user, caps confidence band. See §22 / §19.4. |
| 2026-06-29 | **Beyond Your Ballot dealbreakers: flags not exclusions.** | Yellow flag on card with the specific item name. User decides. See §23. |
| 2026-06-29 | **Media Diet independence definition finalized with examples.** | The Dispatch: in (explored sale but no sale occurred, editorial autonomy intact). Pod Save America: out (Soros Fund investment creates structural partisan incentive). Same bar applied consistently regardless of direction. See §24 and §25. |
| 2026-06-29 | **Admin tool roles: super_admin / admin / user.** | Privacy wall is structural: NO role including super_admin can see individual user quiz answers, dimensional profiles, or conversation history. See §21. |
| 2026-06-29 | **Profile export: plain-text `.txt` from My Profile page.** | Contents specified in §27. Does not include conversation history or feedback data. |
| 2026-06-29 | **Media catalog v1: 60 sources, manually curated.** | Committed as `src/data/media-catalog.csv`. Placeholder for the Ad Fontes API feed (v2). Two flags: `[P]` Partisan Lean, `[R]` Questionable Reliability. |
| 2026-06-29 | **Ninth Mantle type gap: RESOLVED.** | All 10 Civic Mantle types confirmed in `src/lib/quiz/mantles.ts`. |
| 2026-06-29 | **Demographic/lineage data: does NOT enter distance computation.** | Calibration context only, not a values signal. Entering it would reintroduce the partisan framing the product exists to avoid. See §22.9. |
| 2026-06-29 | **Auth methods confirmed: email/password, Google OAuth, magic link.** | All three already built. See `/signup`, `/signin`, `/auth/callback` routes. |
| 2026-06-29 | **Save your progress email: deferred to v2.** | Anonymous users currently lose progress if the browser is closed before account creation. V2 spec in §16 open items. |
| 2026-06-29 | **Admin tool competitive scope: deliberate v1 decisions.** | Evaluated against best-in-class admin tools. Cohort analysis and time-series trending deferred to v2. Field-level audit trail, API access to admin functions, bulk operations, and Perplexity verification included in v1. |
| 2026-06-29 | **Beyond Your Ballot governance filter: description not named orgs.** | Criteria describe what qualifies (cross-partisan organization with members from both parties) with examples (Problem Solvers Caucus, Unite America). No Labels excluded due to political baggage from the 2024 third-party effort. |
| 2026-06-29 | **Eternal Optimist Mantle: confirmed not left-coded.** | Walt Whitman exemplar. Reagan also fits the type. Closed. |
| 2026-07-04 | **Evidence pipeline v1 shipped — resolves the voting-record evidence gap found 2026-07-04.** | Federal sponsorship/cosponsorship via congress.gov per-member endpoints; state legislator sponsorships via Open States; web search enabled in classification for dealbreaker verification (max 5 searches, §19.4 evidence standard restated in prompt). Roll-call votes deferred to v2 (per-vote API shape requires bulk ingestion). Governors rhetoric-only v1. METHODOLOGY_VERSION bumped to 1.1; version mismatch treats cached classifications as stale, forcing reclassification with real evidence. Prompt field renamed votingRecord → legislativeRecord for honesty. Methodology copy reverted to specific 3:1 language. |
| 2026-07-05 | **Production incident: migration 20260703000001 not applied at ship time.** | `20260703000001_quiz_profiles_address.sql` (address + district scalar columns) was written in session but never applied to the live Supabase project. Applied manually via Supabase dashboard 2026-07-05. Supabase CLI was not linked so `supabase migration list` failed and the gap wasn't caught. Standing rule added to AGENTS.md: every session with a new migration file must check migration status before final commit. |
| 2026-07-05 | **Dealbreaker status: four-state presentation via one shared component; unverified items never render as bare assertions.** | All clear → single line with count; mixed → "verified clear on X of Y" + lowercased items under "couldn't verify whether this official:" header; none verifiable → summary only, no list; crossed → flag first, remainder logic beneath. Research line moved outside/left-justified. Replaced 5 inconsistent render sites (comma-join vs list). Also fixed crossed-flag filtering bug: `OfficialCard` was iterating ALL of `official.dealbreakers` regardless of user selections — now filtered to selected item IDs inside `DealbreakerStatus`. |
| 2026-07-05 | **Dealbreaker completeness fix: classifier backfill + engine missing-entry guard.** | Classifier was silently omitting dealbreaker entries it couldn't evaluate, causing the engine to treat them as clear (no data = skip = no flag). Fix: (1) `classifyCandidates.ts` backfills all expected DB-N indices (derived at load time from LAYER4_SECTIONS) as `{ status: 'unknown', note: 'Not evaluated by classifier' }` after the parse loop; (2) `engine/match.ts evaluateDealbreakers` now pushes missing DB entries to `unknownIds` instead of silently continuing. Tests added for both paths. See §19.4. |

---

## Deferred (build later — don't lose these)

- **Profile export shows answer count, not full answer detail (flagged Stage 10, 2026-06-30):** §27.2 calls for L2-L4 answers to be included "if completed." The current export shows a count ("N questions answered") rather than reconstructing each answered question and response, because mapping stored answer IDs back to their originating layer/question reliably was judged higher-risk than valuable for v1 — an incorrect reconstruction would be worse than an honest count. If full answer detail in the export becomes important, this requires building a reliable answerId → layer/question lookup.

- **Demographics opt-out toggle: removed from pre-launch checklist (2026-06-30).** Current demographic data use is export-only and aggregate population-level analytics — no individual-level use that would warrant an opt-out toggle. If demographics data use expands in future (e.g. influencing recommendations), revisit. Founder decision.

- **Pricing/donation model: removed from pre-launch checklist (2026-06-30).** This is a business decision not a technical one — no code implements pricing yet and none is needed for initial testing. Revisit before public launch. Founder decision.

- **Re-classify fidelity limitation (flagged Stage 4a, 2026-06-30):** re-classification of candidates currently runs from stored identity/metadata fields only (name, office, district, party, sourced_from) — the original voting-record text, floor-speech excerpts, and campaign-platform content used in the first classification pass are not persisted, so re-classify is not guaranteed identical to a from-scratch run. Accepted as a v1 tradeoff to avoid storing large raw source text indefinitely. If full-fidelity re-classification becomes important, store original classification inputs in `raw_classification` at first-pass time.

- **Retake → "Edit responses" mode.** The returning-user retake screen ships with
  *Retake from scratch* working and *Edit responses* shown as "Coming soon."
  Still to build (SPEC §"Returning User", Option B): navigate layer by layer,
  answers pre-filled and individually editable, soft cascade prompt when Layer 1
  answers change, profile re-scores on save. This is the path most returning
  users will actually use.
- **DB persistence + accounts** — see Decided row above. **Proposal now drafted
  for review:** [`docs/supabase-persistence-plan.md`](docs/supabase-persistence-plan.md)
  (schema, RLS, anonymous→account merge, rollout phases, open questions). Awaiting
  Matt's sign-off before any build.
- **Surface "your positions / your lines"** — ✅ done on the results page
  (2026-06-12). Listed here only so the history is complete.

---

## Launch blockers — must resolve before go-live

These are not nice-to-haves. Each one is a hard gate on a shipped pillar.

| Date flagged | Blocker | Detail |
|---|---|---|
| 2026-06-30 | **Run classification pipeline against all 60 catalog sources before Media Diet goes live.** | The current fallback (`catalogAdapter.ts` `leanToAxisPlacement`) only populates 2–3 of the 8 dimensions per source based on a coarse left-right lean proxy, leaving axes like `stability_change`, `local_federal`, `national_global`, and `rules_outcomes` at zero confidence for every catalog source. This means Media Diet tier placements currently collapse toward a conventional left-right framing, which undermines the product's core differentiation (8-axis nuance beyond left-right). Real classification must run before this pillar reflects what Bedrock is actually for. Flagged during Stage 9 review. Also tracked in §21.9 pre-launch checklist in SPEC.md. |

---

## Open questions — need Matt's input (by pillar)

These come from the design memos. Not urgent until we start the relevant pillar;
listed so nothing gets lost.

### Engine — implementation gaps to resolve in Stage 3

- **L2 issue-to-axis mapping:** the engine's bounded confidence boost (§19.4) currently uses a structural proxy rather than a real per-question issue-to-dimension map. The proxy checks general axis closeness rather than whether the user's *specific* L2 issue positions corroborate the *specific* axes driving a candidate's alignment. Needs a real issue-to-dimension map built during Stage 3 (classification pipeline) — each L2 question should declare which dimension(s) it's evidence for, and the engine should check corroboration against those specific dimensions rather than general closeness. Tracked 2026-06-30, flagged during Stage 2 review.

### Pillar 1 — Ballot
- Do we **exclude non-ideological offices** (judges, clerks, many nonpartisan
  local seats) from values-matching, and offer different guidance instead?
  — ✅ **resolved 2026-06-29:** yes; judicial/nonpartisan offices show with "values matching doesn't apply here" + endorsements/qualifications. See §22.4.
- What **evidence standard** triggers a dealbreaker exclusion (e.g. "credibly
  accused," "documented pattern of lying")? Editorial-policy call.
  — ✅ **resolved 2026-06-29:** documented statement OR recorded vote OR 2+ independent named journalists; otherwise `unknown` (caps confidence, flagged). See Decided row + §22 / §19.4.
- **Rhetoric vs. record** weighting when placing candidates — has real partisan
  consequences; needs an explicit, defensible rule.
  — ✅ **resolved 2026-06-29:** 3:1 record over rhetoric (record 75% / stated 25%); challenger-only rhetoric capped at 0.5 confidence. See Decided row + §19.4.

### Pillar 2 — Media Diet
- **Which independent creators** make the launch catalog, and how are they
  tiered (confirming / expanding / challenging)? The core editorial judgment.
  — ✅ **resolved 2026-06-29:** 60-source curated catalog (`src/data/media-catalog.csv`); tiering geometry + per-Mantle editorial seed fallback (min 3/tier/Mantle). See §24.
- **Launch catalog size** and minimum "challenging" pool per Mantle type.
  — ✅ **resolved 2026-06-29:** 60 sources at launch; minimum 3 per tier per Mantle via the seed fallback. See §24.7.
- Do we score **mainstream/institutional outlets** too, or independents only?
  — ✅ **resolved 2026-06-29:** independents only, per the §24.9 independence definition. Institutional outlets fail the independence bar. See §24.9.

### Pillar 3 — Conversations
✅ **Complete — all open questions resolved in build (2026-06-29). See Decided rows above.**

---

## Incoming from the Claude Project

- ✅ **Arrived 2026-06-12:** [`docs/data-sources-feasibility-june2026.md`](docs/data-sources-feasibility-june2026.md)
  — the factual web research for all three pillars (sources, pricing, licensing,
  coverage, schema fields, build sequence). See Decided rows above.
- Its own open questions (§11) — recommendation-engine matching formula,
  AllSides-vs-Ad-Fontes primary choice, 19-state down-ballot gap strategy, PBC
  non-commercial eligibility — are **Project/design-space** questions, mirrored
  into the per-pillar lists above where they need Matt's input.
- Future Project research lands the same way: committed under `docs/` or
  `research/`, then reconciled with the matching design memo per pillar.

---

## Post-Launch Roadmap (captured July 1, 2026)

Not spec — future work. These items are deferred until after launch. 
Revisit in Claude Project sessions when ready to build.

### Media Diet v2
- **Ad Fontes API integration** — replace manually curated 60-source catalog with live Ad Fontes data. Currently blocked on pricing/licensing conversation (email drafted, pending send).
- **AllSides ratings integration** — add AllSides bias ratings as a cross-reference signal. Currently blocked on non-commercial eligibility confirmation (email drafted, pending send).
- **Article Bias Checker** — redesign as a proper standalone tool (not a right-rail widget). Full-width layout, unified input (URL / pasted text / file upload, no mode picker), clearer output model distinguishing source reliability from author bias from article framing. `classifyArticle.ts` stays; UX and concept need rethinking. See §24b (deferred).
- **Source descriptions** — improve beyond current catalog entries; add author bios, publication history, notable work.
- **Dynamic catalog growth** — automated ingestion pipeline for new source nominations. Currently manual (suggest-a-source → admin review queue).
- **Returning-user memory** — "You've been reading X for 3 weeks" awareness layer. Requires conversation history infrastructure (currently clean-slate by design).

### Your Ballot v2 (post-primaries, fall 2026)
- **Real candidate classification pipeline** — Issues 3 and 4 from July 1 session. classifyCandidate() improvement: score all 8 axes reliably, Perplexity as fallback for live content, better confidence calibration for incumbents vs. challengers.
- **Automated Beyond Your Ballot population** — Inngest background job running governance filter (§23.5) against all congressional candidates via congress.gov + FEC + Perplexity. Replaces manual static JSON population.
- **Local races and ballot measures** — out of v1 scope. Requires Ballotpedia Ultralocal licensing (covers 31 states; 19 states including NY, MA, NJ still a gap).
- **Printable ballot guide** — spec'd in §22.7, needs end-to-end testing once real candidate data is available.
- **Challenger classification** — improve signal when live content can't be fetched. Perplexity as primary fallback for challengers with no congressional record.

### Platform v2
- **Returning-user homepage hero** — slide copy should change for returning users (currently same three slides for all users; deferred July 1 as a content/design decision requiring full slide copy rethink, not just CTA swap).
- **Conversations save/history** — currently clean-slate by design (v1 decision). v2 feature: optional opt-in history with explicit user consent. Requires Supabase storage design and privacy policy update.
- **Mobile app** — iOS and Android. Post-launch.
- **Pricing/donation model** — not yet decided. Must be decided before or shortly after launch. Options: free, freemium, donation, subscription. Currently unresolved (flagged as pre-launch checklist item).
- **National service / civic action layer** — mentioned in founder's political context. Longer-term platform extension beyond the four current pillars.
- **`pew-typology.ts` Pew group attribution** — Pew group labels on all ten Mantle cards (in pre-launch checklist; not yet built). Carries over to v2 if not completed pre-launch.


---

## 2026-07-03 — Conversations input: guided sentence-builder replaces chip-wall

**Decision:** Replace the freeform-box-plus-chip-wall input pattern in all three Conversations modes with a guided sentence-builder for Modes 1 and 3, and a freeform-primary + chip-tail pattern for Mode 2.

**What changed:**
- Mode 1 (Openers): Sentence "I want to talk to [WHO] [connective] [TOPIC-OR-POSTURE], and what usually goes wrong is [WRONG]." with tappable blanks, inline pickers, optional tail. Assembles into ONE string sent to decode endpoint.
- Mode 2 (Responses): Freeform quote box remains primary. Chip tail for "What's the vibe?" and "What's their posture?" sent as routing inputs (unchanged from prior architecture, chips are still a separate payload).
- Mode 3 (Back-and-forth setup): Sentence "I'm going to talk to [WHO] [connective] [TOPIC-OR-POSTURE], and I'm worried I'll [WORRY]." Same blank/picker pattern. Hands off unchanged to §18.6b chat architecture.

**Why:** The chip-wall beside the freeform box created two parallel input surfaces that could conflict (user fills freeform with a topic, taps a different posture chip — mismatch). The sentence builder is ONE surface: the blanks compose the freeform string itself. The old standalone chips were removed 2026-07-02; this is not re-adding them.

**Grammar-shaping:** Deterministic (no model call). Topic chip → connective "about"; posture chip → connective "and the hard part is that". Free-typed input classified by leading-pronoun / stance-verb heuristic.

**Rollback:** Single commit touching only `src/app/conversations/page.tsx`, `SPEC.md`, and `DECISIONS.md`. Cleanly revertable via `git revert <sha>` with zero side effects on output rendering, §18.6b chat loop, or §18.7 profile injection.

---

## 2026-07-03 — Challenging tier floor recalibrated: 0.60 → 0.40 (tension_on_held)

**Decision:** Challenging tier floor recalibrated: 0.60 → 0.40 (tension_on_held); reliability/good_faith/independence restored to original values.

**Why:** The 2026-07-02 relaxation loosened the wrong variable. Running computeTensionOnHeld against all 25 quality-clearing sources (SQL-verified: all 62 approved with real 8-axis placements) across all 10 Mantle profiles showed zero sources clearing 0.60 or 0.55 for any Mantle. 0.40 is the first threshold where every Mantle clears the §24.7 three-source minimum. Known gap: Long Gamer and Steward get 2 natural matches each; accepted per founder decision, covered by topUp; revisit with targeted catalog additions.

---

## 2026-07-03 — Your Officials specced as §22b

**Decision:** Your Officials specced as §22b — reuses Your Ballot route and the candidate classification pipeline verbatim.

**Why:** No new classification code: getOrClassifyCandidate treats sitting officials like candidates (record 3:1 over rhetoric). New code limited to fetchCurrentOfficials (congress.gov current members + Open States + governor lookup) and mode rendering on /your-ballot. Display: constellation overlay + per-dimension notes + dealbreaker flags (ported from RankedCandidateCard), confidence caveat for thin records. Scope: 2 senators, House rep, governor, 2 state legislators.

---

## 2026-07-03 — resolveDistrict migrated off the dead Google Civic Representatives endpoint

**Decision:** resolveDistrict migrated off the dead Google Civic Representatives endpoint to divisionsByAddress.

**Why:** Representatives API turned down 2025-04-30; resolveDistrict.ts was still calling it — masked by /your-ballot's HOLDING_STATE, caught during the officials build. Same divisions-keyed response shape; normalizedInput handled defensively (falls back to raw input string). Also fixed operationally: GOOGLE_CIVIC_API_KEY existed only in .env.local, never in Vercel — add to Production alongside new GOOGLE_PLACES_API_KEY.

## 2026-07-03 — Pillar 1 is seasonal: Your Ballot (in season) / Your Officials (off season)

**Decision:** One pillar, two seasonal faces — not a fifth pillar. Season controlled by an admin flag (`site_config.pillar_one_mode`, default `'officials'`), not auto-detection.

**Why:** Five pillars breaks every 2×2 grid and the Beyond Your Ballot naming anchor. Auto-detection rejected: primaries are state-by-state and homepage/nav render before any address exists — season is an editorial judgment via /admin. Three-tier copy system; flipping touches zero copy files. New copy passed a two-critic bias check 2026-07-03; two revisions adopted (dealbreaker exception in scorecard FAQ; data-honesty hedge in officials coverage note).

## 2026-07-03 — ZIP removed as an input everywhere; one canonical address with Google Places Autocomplete (New), Details-free

**Decision:** ZIP removed from quiz, Your Ballot, and Beyond Your Ballot. Shared `AddressAutocomplete` component (server-proxied key, 300 ms debounce, manual fallback) in quiz + both pillar pages; districts stored as promoted scalars in `quiz_profiles`; pages read profile first and show stored address.

**Why:** ZIP can't resolve districts (straddles CD/SLDU/SLDL lines) and Beyond Your Ballot was double-capturing (ZIP banner + address form). No Place Details calls ever — suggestion text feeds `divisionsByAddress`; billing stays in Autocomplete Requests SKU (10 K free/mo, ~$2.83/1 K). Privacy page gains explicit address row. Legacy `zipCode` left in demographics jsonb, read by nothing.

## 2026-07-04 — Public Lookup Mode: Officials (and, dormant, Ballot) show real results to anonymous visitors — name/office/party only, zero classification calls — before gating the values-match layer behind the quiz.

**Decision:** The prior hard "Start with the quiz" gate delivered zero value pre-quiz despite district resolution already being live. Split into two tiers: unclassified lookup (free, no account, no LLM cost) vs. classified match (requires a profile). This is also a deliberate cost/abuse control — classification is live Claude API calls per official; gating it behind "has a profile" bounds the cost surface for anonymous/bot traffic. Address carries over into the quiz via existing pendingAddress plumbing rather than being re-asked. One shared `PublicLookupGate` component serves both Officials and Ballot modes (Ballot's is dormant until BALLOT_DATA_READY).

**Why:** Factual representation data (who is your senator, who is your governor) is already live infrastructure — blocking anonymous visitors from seeing it provides no product benefit and destroys first-session value. The values-match layer (axis scores, constellation, dealbreaker flags) is the actual product and remains gated. `fetchCurrentOfficialsUnclassified` calls the same congress.gov/Open States endpoints as the classified path but skips `getOrClassifyCandidate` entirely — cost surface is bounded by the API rate limits themselves, not LLM usage.

**2026-07-04** — **Your Officials is exempt from the pre-existing SPEC §2 Unlock Ladder; Ballot mode keeps it.** Batch 6's Public Lookup Mode was scoped to give real value to fully anonymous, zero-quiz-progress visitors, but the pre-existing Layer-3 Unlock Ladder gate ran before the officials/ballot season-routing check, silently blocking every anonymous visitor from ever reaching it — caught via real incognito testing. Fixed by moving the officials-mode routing check above the Unlock Ladder gate. Rationale: "unlocked" has always meant "enough data to match values," which doesn't apply to a feature explicitly designed to work with zero quiz data.

**2026-07-04** — **Root cause of CONGRESS_GOV_API_KEY failures (Batches 7–11): empty-string value, not a missing or misnamed key.** `Object.keys(process.env)` showed the key present and correctly scoped/named in Vercel, but the stored value was `''` — falsy, indistinguishable from absent without checking `.length` directly. Three diagnostic batches were required to isolate this because UI-based inspection of Vercel's dashboard does not visually distinguish an empty-string value from a set value. Fix: delete and recreate the variable in Vercel with the key value pasted fresh (editing in place did not resolve it). Lesson: when an env var is "present but not working," check `.length` not just truthiness.

**2026-07-04** — Incumbent values-matching stays as shipped in §22b; broader "match me to any sitting official nationwide" (external suggestion) deferred — Your Officials covers the user's own six officeholders only. Revisit post-launch.

**2026-07-04** — No full-site imagery. Stark design is brand. Only approved imagery: forebear portraits on mantle cards (back portrait + front corner teaser).

## 2026-07-05 — Nav signed-out auth CTA: 'Create an account' + 'Sign in' pair

**Decision:** The single 'Sign in' text link is replaced by a two-element pair — an outlined 'Create an account' button (→ /signup) and a lower-contrast 'Sign in' text link (→ /signin). Both show simultaneously when signed out; both disappear when signed in. No single button that flips label based on some guess about returning-user status.

**Why:** A signed-out visitor is anonymous — we cannot distinguish a first-time user from a returning one before they authenticate. Showing only 'Sign in' loses new visitors who don't know to click it; showing only 'Create an account' loses returning users who are confused. The pair serves both audiences without guessing. Applies to both desktop nav and mobile hamburger.

## 2026-07-05 — HomeTeaser.tsx deleted

**Decision:** Deleted src/components/home/HomeTeaser.tsx. The four-question homepage ghost-constellation sketch it rendered was removed from HomeContent.tsx during the launch QA pass (nothing imported it anymore). Keeping the file would mean carrying stale code and a stale 'fifteen questions' copy string with no rendering path. Deleted rather than archived.

## 2026-07-05 — Returning-home greeting gated on auth, not quiz completion

**Decision:** HomeContent's greeting slot now reads the Supabase auth session (same pattern as Nav). Three states: undefined (resolving — slot hidden), null (anonymous — shows 'Your mantle.' + 'Create an account to save your results.' link), User (signed in — shows 'Welcome back, name.'). The returning-user layout (mantle summary, pillar cards) remains keyed on session.result and is still visible to anonymous completers.

**Why:** An anonymous quiz-completer saw 'Welcome back.' alongside a nav showing 'Create an account' — direct contradiction that implied an account existed. Layout and greeting are now separate concerns: layout is store-gated (useful with zero auth), greeting is auth-gated (only warm users who actually have an account).

## 2026-07-05 — Officials blank-screen bug: surface errors, tighten key validation

**Decision:** Two hardening changes to the officials fetch path.

(A) All three catch blocks around fetchCurrentOfficials calls in your-ballot/page.tsx now log the error via console.error and call setFetchError with a user-visible retry message. Previously they swallowed the error silently, leaving officials=null with no feedback and no way to diagnose the cause.

(B) API key guards in currentOfficials.ts changed from !apiKey (falsy) to !apiKey || apiKey.length === 0 (empty-string-safe). The Vercel dashboard shows an empty-string env var as 'set', but it is functionally absent — this is the fifth occurrence of this trap in the project history. Top-level env checks in both fetchCurrentOfficials and fetchCurrentOfficialsUnclassified updated to use optional-chain .length for the same reason.
