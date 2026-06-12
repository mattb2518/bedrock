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
| 2026-06-12 | **First pillar to build = Conversations.** | Lowest data risk: needs only Layer 1 + a Claude system prompt; the Project only has to confirm model/pricing. Ballot and Media need heavier factual research + editorial curation. |

---

## Deferred (build later — don't lose these)

- **Retake → "Edit responses" mode.** The returning-user retake screen ships with
  *Retake from scratch* working and *Edit responses* shown as "Coming soon."
  Still to build (SPEC §"Returning User", Option B): navigate layer by layer,
  answers pre-filled and individually editable, soft cascade prompt when Layer 1
  answers change, profile re-scores on save. This is the path most returning
  users will actually use.
- **DB persistence + accounts** — see Decided row above.
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
- **Save chat history** or not? (Memo recommends opt-in, off by default.)
- Sign-off on the **neutrality guardrails** (P1–P9 in the memo) before launch.
- Confirm the **model + pricing** (Project research) — memo flagged these VERIFY.

---

## Incoming from the Claude Project

When the Project's web research lands, save it to `research/` (e.g.
`research/project-web-findings.md`) so it's preserved and synced even before we
act on it. It will be reconciled with the matching design memo when we start each
pillar.
