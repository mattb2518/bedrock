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

---

## Deferred (build later — don't lose these)

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

## Open questions — need Matt's input (by pillar)

These come from the design memos. Not urgent until we start the relevant pillar;
listed so nothing gets lost.

### Pillar 1 — Ballot
- Do we **exclude non-ideological offices** (judges, clerks, many nonpartisan
  local seats) from values-matching, and offer different guidance instead?
- What **evidence standard** triggers a dealbreaker exclusion (e.g. "credibly
  accused," "documented pattern of lying")? Editorial-policy call.
- **Rhetoric vs. record** weighting when placing candidates — has real partisan
  consequences; needs an explicit, defensible rule.

### Pillar 2 — Media Diet
- **Which independent creators** make the launch catalog, and how are they
  tiered (confirming / expanding / challenging)? The core editorial judgment.
- **Launch catalog size** and minimum "challenging" pool per Mantle type.
- Do we score **mainstream/institutional outlets** too, or independents only?

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
