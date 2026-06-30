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

---

## Deferred (build later — don't lose these)

- **Profile export shows answer count, not full answer detail (flagged Stage 10, 2026-06-30):** §27.2 calls for L2-L4 answers to be included "if completed." The current export shows a count ("N questions answered") rather than reconstructing each answered question and response, because mapping stored answer IDs back to their originating layer/question reliably was judged higher-risk than valuable for v1 — an incorrect reconstruction would be worse than an honest count. If full answer detail in the export becomes important, this requires building a reliable answerId → layer/question lookup.

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
