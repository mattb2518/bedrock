# Pillar 3 — Your Conversations: Scoping Memo

*Design/scoping research. Author: research session. Date: 2026-06-11.*
*Status: scoping draft for the "Your Conversations" feature (SPEC.md §16). Not a build spec.*

> **Verification caveat.** This environment blocked live web access and the `claude-api` skill at run time, so the model-id and pricing figures below could **not** be re-confirmed against current Anthropic docs. They are stated from the latest knowledge available and are flagged as **VERIFY** wherever a number or id is load-bearing. Before build, confirm against the canonical sources listed in the Technical Shape section. The product's own SPEC already carries the same flag (SPEC.md lines 1247, 1697).

---

## Summary (5 bullets)

- **The chat needs surprisingly little from the quiz.** A compact "context key" — the primary Mantle type, the 8 dimension scores with poles/labels, the user's self-nominated top-3 dimensions, and any secondary types — is enough to tailor guidance. This is **Layer 1 data almost entirely**; Layers 2–4 are optional enrichment, not requirements.
- **Inject the profile as a structured, cached system prompt**, not as retrieved context. The profile is small (a few hundred tokens), stable across the whole session, and needed on every turn — that is the textbook case for a cached system block, not RAG.
- **Four core flows** cover the surface: (1) **Prep** before a hard conversation, (2) **In-the-moment framing** help, (3) **Debrief** after, and (4) **Understand the other side** / steelman. All four share one engine and one profile context; they differ only in the opening prompt scaffold.
- **Neutrality is the whole ballgame.** The defining risk is that a values-aware assistant becomes a persuasion-optimizer or a bias-amplifier. The guardrails below center on a hard line: **help the user understand and be understood — never help them win, manipulate, or "handle" the other person.**
- **Recommended model: latest Sonnet** as the default conversational engine (fast, cheap, strong at nuanced social reasoning), with **latest Opus** reserved for the heavier "understand the other side" steelman flow if quality testing shows Sonnet falls short. Cost posture is low: short-to-medium turns, a cached profile, no document retrieval.

---

## What the chat needs from the profile (the minimum context key)

The chat's job is to tailor guidance to *this* user: their values, their blind spots, and the friction they're likely to feel with someone who is different. To do that it needs a stable, compact description of the user's civic identity. It does **not** need the raw quiz answers, the scoring math, or the recommendation engine's exclusion rules.

**Minimum viable context key (the contract between quiz output and chat):**

| Field | Source layer | Why the chat needs it |
|---|---|---|
| `primary_type` (label + working name + one-liner) | L1 | The headline identity. Lets Claude speak to the user as, e.g., "as a Rooted Pragmatist, your instinct will be…" |
| `dimension_scores[8]` (axis, pole A/B labels, score, lean) | L1 | The actual fingerprint. Drives "where your values will rub against theirs" reasoning per axis. |
| `top_dimensions[≤3]` (user-nominated most-central) | L1 (the 21st item) | Tells Claude which values the user holds most tightly — i.e. where they are *least* flexible and most likely to get defensive. High-signal for friction prediction. |
| `secondary_types[1–3]` (if surfaced) | L1 | Nuance; signals a user who holds tension across types, which changes the coaching tone. |
| `edge_case_flag` (centered / scattered / near-pure) | L1 | Materially changes guidance. A "centered" user already sees both poles; a "near-pure" user needs more blind-spot coaching. |
| `completeness_pct` | L1–L4 | Lets Claude calibrate confidence and, if low, gently note the profile is partial. |

**Optional enrichment (only if present — never required):**

- `issue_positions` (L2) — concrete stances on real policy debates. Useful only when the conversation topic overlaps a position the user has actually recorded; lets Claude ground "your view here is X" instead of inferring from dimensions. Nice-to-have, not load-bearing.
- `priority_intensity` (L3) — how much the user cares about each issue. Helps Claude judge which disagreements are worth the user's energy.
- `dealbreakers` (L4) — **deliberately probably excluded.** These are exclusion filters for the *ballot* engine. Importing "lines the user won't cross" into a conversation-coaching context risks the opposite of the feature's goal (curiosity over opposition). If used at all, use only to help the user *recognize* their own hard limits, never to harden them. See Guardrails.

**The single matching key.** If we want one canonical handle the chat reads, it is the **profile object keyed by `user_id` containing `primary_type` + `dimension_scores[8]` + `top_dimensions`**. Everything else degrades gracefully. The chat must run on Layer 1 alone, because most users will only have completed Layer 1 (~40% completeness; progressive-depth model, SPEC §2).

**Shape of injection (illustrative — not final wording):**

```
The user has completed Bedrock's civic-values quiz. Their civic identity:

PRIMARY TYPE: The Good Neighbor (Rooted Pragmatist) —
  "Believes the best solutions start closest to home."

DIMENSIONAL PROFILE (8 axes, each a spectrum; score 0–100, 50 = center):
  Stability↔Change:        32  (leans Stability)
  Local↔Federal:           18  (strongly Local)
  National↔Global:         44  (slight National)
  Rules↔Outcomes:          61  (leans Outcomes)
  Markets↔Governance:      50  (centered)
  Pragmatism↔Idealism:     27  (leans Pragmatism)
  Individual↔Collective:   66  (leans Collective)
  Trust↔Skepticism:        58  (slight Skepticism)

MOST CENTRAL TO THEM (self-nominated): Local, Pragmatism, Individual↔Collective.

Use this to anticipate where THIS user's instincts will clash with someone
different, and where their own blind spots are. Do not flatter the profile;
name its tensions honestly.
```

The reasoning the chat should derive from this is the product value: e.g. *"You lean strongly Local and Pragmatic — talking to someone who reasons from Federal, Idealist first principles, your friction won't be the topic, it'll be that you're optimizing for 'what works here' while they're optimizing for 'what's right everywhere.' Name that out loud and the conversation gets easier."*

---

## Core conversation flows

All four flows share one chat engine, one persistent profile context, and the same non-judgmental voice (SPEC §16). They differ only in the opening scaffold and the shape of the help. UX open question (form vs. conversational vs. template, SPEC §16) is downstream of these — recommend a **light structured opener that drops into free chat**.

### Flow 1 — Prep (before a hard conversation) — *primary use case*
**User provides:** who they're talking to, that person's approximate position, the topic, and optionally the relationship/stakes.
**Claude helps with:**
- Where the other person is likely coming from (mapped against the user's own dimensions, so the contrast is concrete).
- Genuine common ground — surfaced honestly, not manufactured.
- The user's *own* likely friction points and defensive triggers ("your top dimension is X; when they hit it you'll want to argue — here's what to do instead").
- A way in: an opening that leads with curiosity.
**Output:** better thinking and a few framings — **not a script** (SPEC §16: "The output is better thinking, not talking points").

### Flow 2 — In-the-moment framing help
**Context:** user is mid-conversation (or about to step back into one) and stuck.
**User provides:** what was just said / where it went sideways.
**Claude helps with:** a quick reframe, a de-escalation move, a question to ask instead of a rebuttal, or permission to pause. Short, fast turns — favors the cheap/fast model.

### Flow 3 — Debrief (after a conversation)
**User provides:** what happened, what landed, what didn't.
**Claude helps with:** processing without re-litigating; distinguishing "we disagreed" from "it went badly"; what to try next time; noticing where the user's own values drove their reactions. Builds the user's skill over time.

### Flow 4 — Understand the other side (steelman)
**User provides:** a position they find hard to understand or are tempted to dismiss.
**Claude helps with:** the strongest, most good-faith version of that view, explicitly connected to honorable values (the dimensional model's premise: every pole has a defensible answer — SPEC line 1419). This is the most cognitively demanding flow and the best candidate for the **Opus** tier.

**Cross-flow note.** Integration with ballot recs ("help me talk to my neighbor about Candidate X", SPEC §16 open question) is a *thin wrapper over Flow 1*: it pre-fills the topic/position from ballot data. No new engine needed — defer until ballot is stable.

---

## Guardrails & neutrality principles

This pillar touches politics, persuasion, and a user who arrives with a known value profile. That combination is the risk. A values-aware coach can quietly become a bias-confirmation machine or a manipulation tutor. The guardrails exist to prevent exactly that.

**P1 — Understanding over winning.** The product goal is clarity and being understood, not victory. Claude never helps the user "win," "destroy," "trap," or "handle" the other person. If asked for that, it reframes toward mutual understanding. (Directly downstream of SPEC §16's stated goal.)

**P2 — No manipulation, ever.** No rhetorical manipulation, no dark patterns, no exploiting the other person's psychology, no "tell them X so they'll feel Y." Persuasion through honest argument and genuine listening is fine; persuasion through manufactured leverage is not. This is the brightest line.

**P3 — Even-handed across the spectrum.** Claude must give a user on *any* side the same quality of help, and must steelman the *other* side with the same generosity it extends to the user's side. The dimensional model's founding claim — every pole has an honorable position — is the operational test: if Claude can't articulate the other view as honorable, it's failing.

**P4 — Don't amplify the user's bias.** Knowing the profile is for *anticipating friction and naming blind spots*, not for telling users what they want to hear. Claude should be willing to say "your instinct here is a blind spot of your type." The profile is a mirror, not a cheerleader. (This is the subtle failure mode unique to a values-aware assistant — worth explicit red-teaming.)

**P5 — Bad-faith asks get redirected, not serviced.** "Help me own this person," "give me gotchas," "how do I make them look stupid," "how do I get them to vote how I want" → Claude declines the framing and offers the understanding-oriented version. It does not lecture; it redirects warmly.

**P6 — No facts laundering / no covert advocacy.** Claude shouldn't smuggle contested empirical claims into "framings." When a disagreement hinges on facts, it says so and stays neutral on the facts rather than picking the user's side.

**P7 — Stay in lane on harm.** Civic disagreement is the scope. Dehumanization, harassment, or conversations aimed at targeting a group are out of scope and declined. Distinguish "I disagree with my brother on immigration" (in scope) from "help me corner my coworker" (out).

**P8 — Humility about the other person.** Claude only knows the other person through the user's description and should say so — it's coaching the user, not modeling a real third party it can't see. (Maps to SPEC §16 open question about other-person data: recommend **no** external data on the other person; rely on the user's account, and flag the user's framing as one-sided when it clearly is.)

**P9 — Privacy continuity.** The profile in context is processed in real time only, consistent with the privacy commitments (SPEC "On Claude," lines 1694–1697): profile data passes to Anthropic only as needed to process each turn, not for storage or training. Whatever conversation-history decision is made (SPEC §16 open question), it must honor "see it / export it / delete it."

**Implementation:** these become the conversational system prompt's behavioral contract, layered *above* the per-user profile block. Recommend a dedicated red-team pass (the SPEC already plans an Opus-driven "what would a critic from the left and from the right say" review for the quiz — apply the same to this system prompt).

---

## Technical shape (model, context delivery, cost)

> **VERIFY all model ids / prices below against current docs before build.** Web access was blocked this session.

### Model
- **Default engine: latest Claude Sonnet.** The conversational flows (1–3) are nuanced social reasoning over short-to-medium context — Sonnet's sweet spot, and the right cost/latency point for an interactive chat. The SPEC's own forward references use the Opus 4.7 generation for heavy reasoning tasks (lines 1240, 1256); by the same logic, day-to-day conversation coaching does **not** need Opus.
- **Premium tier: latest Claude Opus**, gated to **Flow 4 (steelman / understand-the-other-side)** if and only if quality testing shows Sonnet's steelmans aren't generous/precise enough. Don't pay Opus rates on every turn.
- **Do not use a Haiku-tier model** as the primary engine: the neutrality/blind-spot reasoning is exactly where a smaller model is most likely to flatten nuance or slip into bias. Haiku-tier is only reasonable for non-coaching utility calls (e.g. classifying an input as in/out of scope).
- **Action item:** confirm the current latest Sonnet and Opus model ids and context windows at build time — `https://docs.anthropic.com/en/docs/about-claude/models/overview`.

### Context delivery — system prompt + caching, NOT retrieval
- The profile is **small** (the context key is a few hundred tokens), **stable for the whole session**, and **needed on every turn**. That is the definition of a cached system block — not a RAG retrieval problem. Resist the urge to build a vector store for this; there's nothing to retrieve.
- **Structure:** two-layer system prompt — (a) the static behavioral/neutrality contract (identical for all users, highly cacheable), then (b) the per-user profile context key. Place the static contract first so the longest stable prefix is cacheable.
- **Prompt caching** makes the repeated system prompt nearly free after the first turn of a session: cached reads are billed at a steep discount vs. normal input tokens, with a smaller one-time cache-write premium. This is the single biggest cost lever here. (**VERIFY** current cache read/write multipliers and minimum cacheable-token threshold: `https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching`.)
- **Multi-turn / memory:** within a session, send the running message history (standard multi-turn). Across sessions, "memory" = re-injecting the same profile context key (it's persistent by design) plus, optionally, a short summary of prior conversations *if* history is saved. Whether to save history is an open SPEC question; recommend **off by default / opt-in**, both for privacy and because each conversation is largely self-contained. If turn counts grow long, summarize older turns rather than carrying full history.

### Cost posture (rough, to de-risk only)
- Interaction profile: short user inputs, medium assistant replies, a cached ~few-hundred-token system prefix, no documents. This is a **cheap** workload per conversation.
- Dominant cost is **output tokens on Sonnet**; the profile/system overhead is largely absorbed by caching. A typical prep conversation (a handful of turns) is fractions of a cent to low single-digit cents on Sonnet at current rates. Opus on Flow 4 raises per-turn cost materially, which is the reason to gate it.
- **VERIFY** current per-million input/output prices for the chosen Sonnet/Opus ids before modeling unit economics: `https://www.anthropic.com/pricing` and the models overview page above.
- No fine-tuning, no embeddings infra, no retrieval store needed → near-zero fixed cost beyond the API itself.

---

## Quiz dependencies (plainly)

| Layer | Needed by this pillar? | Detail |
|---|---|---|
| **L1 — Who you are** | **Required.** | The entire context key (primary type, 8 dimension scores, top-3 dimensions, secondary types, edge-case flag) comes from L1. The chat must work on L1 alone, since ~40%-completeness L1-only users are the common case. |
| **L2 — How you apply it** | **Optional enrichment.** | Issue positions let Claude ground guidance in concrete recorded stances when topic overlaps. Graceful degradation if absent. |
| **L3 — What drives your vote** | **Optional enrichment.** | Priority intensity helps judge which disagreements are worth the user's energy. Not required. |
| **L4 — Where you draw the line** | **Not needed — probably deliberately excluded.** | Dealbreakers are *ballot-engine exclusion filters*. Importing "hard lines" into a curiosity-first conversation tool works against its goal. Use at most to help users recognize their own limits; never to harden them. |

**Net:** this pillar depends on **Layer 1 and nothing else** to ship. Everything beyond L1 is upside, gated behind "is it present," never a blocker.

---

## Open questions

1. **History persistence** (SPEC §16) — save conversations or not, and for how long? Recommend opt-in, off by default. Decision affects cross-session memory design and privacy copy.
2. **UX opener** (SPEC §16) — light structured form vs. pure chat vs. template. Recommend a thin structured opener (who / their position / topic) that drops into free chat. Needs design.
3. **Other-person data** (SPEC §16) — recommend **no** external lookup; coach from the user's account only. Confirm.
4. **Ballot integration timing** (SPEC §16) — thin wrapper over Flow 1; defer until ballot is stable.
5. **How profile updates propagate** — if a user retakes a layer mid-relationship-with-the-tool, the next session simply re-reads the updated context key. Confirm the chat always reads live profile, never a cached copy.
6. **Sonnet-vs-Opus quality bar for Flow 4** — needs an actual eval: do Sonnet steelmans clear the "honorable other side" bar? Cheapest way to settle the model gating.
7. **System-prompt red-team** — schedule the left-critic/right-critic adversarial pass on the neutrality contract before launch (mirror SPEC's planned quiz bias review).

---

## Recommendation

**Build it on Layer 1, on the latest Sonnet, with the profile delivered as a cached two-layer system prompt — and treat neutrality as the core engineering requirement, not a content afterthought.**

Concretely:
1. Define the **context key** (primary type + 8 dimension scores + top-3 + secondary + edge flag) as the formal contract between quiz output and chat. Ship the chat the moment a user has L1.
2. Compose the system prompt as **static neutrality/behavior contract (cached) + per-user profile block.** No retrieval store.
3. Ship the **four flows** behind one engine with per-flow openers; gate Opus to Flow 4 pending an eval.
4. Run a **bias/neutrality red-team** on the system prompt before launch; bake P1–P9 in as the behavioral contract.
5. Defaults on the open questions: history **opt-in/off**, **no** external other-person data, **thin** structured opener, ballot integration **deferred**.
6. Before build, **re-verify** every model id and price flagged **VERIFY** above against the current Anthropic docs (links inline) — this could not be done in-session, and the SPEC already carries the same standing flag.

---

### Sources / to-verify URLs
- Anthropic models overview & ids — `https://docs.anthropic.com/en/docs/about-claude/models/overview`
- Anthropic pricing — `https://www.anthropic.com/pricing`
- Prompt caching — `https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching`
- Anthropic privacy / API data handling — `https://www.anthropic.com/privacy` (confirm "not stored / not used for training" claim per SPEC line 1695)
- Internal: `SPEC.md` §2 (Product Architecture), §3 (Eight Dimensions), §4 (Civic Mantle), §16 (Your Conversations), privacy "On Claude" (lines 1694–1697)

*Note: model-id, pricing, and caching specifics above were NOT live-verified this session (web + claude-api skill access were blocked in this environment). They reflect best available knowledge and must be confirmed against the URLs above before any build decision.*
