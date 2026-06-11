# Pillar 1 — Your Ballot: Matching Design

*Design memo. Grounds: SPEC.md §2 (Product Architecture, four-layer quiz), the 8-dimension model in `src/lib/quiz/dimensions.ts`, the ten Mantle profiles in `src/lib/quiz/mantles.ts`, and SPEC Layer 3 (priority intensity, L3-Q4 downballot salience) + Layer 4 (dealbreaker screen). Factual API/licensing questions (Ballotpedia/VoteMate coverage, pricing, freshness) are handled separately in a web-enabled tool and are deliberately out of scope here.*

---

## Summary (5 bullets)

- **The match runs in our own 8-axis space, not in candidate-space.** Candidates are projected into a `DimensionalProfile` (0–100 per axis) by the same model that scores users; a recommendation is then a distance computation, identical in shape to `classifyProfile()` in `mantles.ts`. This keeps one geometry across the whole product.
- **The minimum viable contract is narrower than the full quiz.** Layer 1 alone (8 axes + the up-to-3 importance weights) is enough to produce a *defensible, hedged* recommendation. Layers 2–4 sharpen it; **Layer 4 dealbreakers are the only layer that can change a winner**, because they act as hard excludes, not as distance.
- **Down-ballot is a coverage problem, not a model problem.** The math degrades gracefully on its own: the fewer axes we can confidently place a candidate on, the lower the match confidence and the wider the explanation hedges. We never fabricate a placement to fill an axis.
- **Confidence is a first-class output, not a footnote.** Every recommendation ships with a confidence band derived from (a) how many axes the candidate is placed on, (b) source quality/recency, and (c) how *separated* the top candidates are. "We don't have enough to say" is a legitimate, designed result.
- **Two-stage pipeline:** Layer 4 filters (hard excludes) run *first* and unconditionally; dimensional distance ranks only the survivors, weighted by Layer 1 importance and Layer 3 intensity. A dealbreaker beats alignment every time — this is stated in SPEC and must be literal in code.

---

## Candidate positioning model

### Goal
Place each candidate at a point (or region) in the same 8-axis 0–100 space the user lives in, so `distance(user, candidate)` is meaningful. The axes are fixed by `dimensions.ts`:

`stability_change · local_federal · national_global · rules_outcomes · markets_governance · pragmatism_idealism · individual_collective · trust_skepticism`

### What candidate signals map to which axis
Each axis is scored from observable, sourceable signals. The mapping below is the *design intent*; which signals are actually available per race is the coverage question handled elsewhere.

| Axis (poleA→poleB) | Strong candidate signals | Notes / failure mode |
|---|---|---|
| **stability_change** (Stability→Change) | Incumbent-vs-challenger posture, "reform/overhaul" vs "protect/restore" language, votes on structural change | Rhetoric-heavy; campaign language inflates Change. Lean on voting record where it exists. |
| **local_federal** (Local→Federal) | Stated preference for federal vs state/local solutions; positions on preemption, block grants, federalism | Office level confounds this — a school-board candidate has no "federal" signal. **Often unscorable down-ballot.** |
| **national_global** (National→Global) | Trade, alliances (NATO etc.), immigration framing, multilateralism vs sovereignty | Near-zero signal for most local races. Leave unscored rather than impute. |
| **rules_outcomes** (Rules→Outcomes) | Process/rule-of-law emphasis vs results-justify-means; originalism vs pragmatic statutory reading (judicial races) | One of the few axes with *real* down-ballot signal (judges, prosecutors). |
| **markets_governance** (Markets→Governance) | Regulation, taxation, public-vs-private provision of services | Scorable at state level; thin for non-fiscal local offices. |
| **pragmatism_idealism** (Pragmatism→Idealism) | Compromise/dealmaking record vs principle-first stances; cross-aisle votes | Hard to source; often inferred from behavior, not statements — low-confidence axis generally. |
| **individual_collective** (Individual→Collective) | Safety-net, collective-action, community-obligation positions vs individual-liberty framing | Reasonable signal at most levels. |
| **trust_skepticism** (Trust→Skepticism) | Posture toward institutions, expertise, agencies; "drain/dismantle" vs "strengthen/fund" | Decent signal where there's any record; rhetoric-prone. |

### How a candidate point is built
1. **Evidence → per-axis estimate + per-axis confidence.** For each axis we produce a value in 0–100 *and* a confidence in [0,1]. An axis with no usable evidence gets confidence 0 and is omitted from the match (not defaulted to 50 — see below).
2. **Provenance attached to every axis.** SPEC's "transparent sourcing / show our work" promise means each axis estimate must carry the source(s) and a one-line rationale, so the per-race explanation can be generated, not asserted.
3. **No silent imputation.** Defaulting a missing axis to the neutral midpoint (50) is the single most dangerous shortcut: 50 is not "unknown," it reads as "moderate," and it would systematically pull every sparse candidate toward the center of the space — manufacturing false matches for down-ballot races. Missing must mean *absent from the distance computation*, with confidence reflecting the gap.

### Where the model breaks down
- **Down-ballot thinness.** Below state legislature, 3–5 of the 8 axes typically have no signal (`local_federal`, `national_global`, often `pragmatism_idealism`, `markets_governance`). The model still works on the surviving axes, but confidence must drop hard.
- **Rhetoric ≠ behavior.** Campaign language skews Change / Idealism / Skepticism upward. Where a voting record exists it should outrank stated positions; this is a weighting rule in the placement model, separate from user-side weighting.
- **Office-level confounds.** `local_federal` partly measures the *office*, not the *person*. A federal candidate is not "more Federal" as a value just because they run for federal office. Placement must read the candidate's stated *preference about* the federal/local balance, not their seat.
- **Single-issue / low-information candidates.** Some real candidates have one position and nothing else. The honest output is a 1–2 axis placement with very low confidence, not a confident point.
- **Non-ideological offices.** Many judicial/administrative/nonpartisan races aren't ideological at all. Forcing them into an 8-axis values frame can be a category error — flagged as an open question below.

---

## Minimum matching key (the quiz → engine contract)

This is the explicit interface the quiz must hand the engine. It is deliberately *layered*, mirroring SPEC's progressive-depth model (~40/65/85/100% completeness).

### Tier 0 — Required floor (after Layer 1, ~40%)
The engine can produce a **defensible but hedged** recommendation from Layer 1 alone:
- **`DimensionalProfile`** — all 8 axes, 0–100. This is the non-negotiable core. *(`@/types/quiz` `DimensionalProfile`.)*
- **Importance weights** — the up-to-3 dimensions the user flagged as "most central" at the end of Layer 1 (SPEC line 71). Encoded as per-axis weights; the 8th-axis default is uniform.
- **Per-axis lean confidence (derived, not asked).** Axes where the user sat near 50 or repeatedly chose "It depends" should carry lower weight automatically — SPEC explicitly tracks "which dimensions produce the most genuine uncertainty" (line 1591). This feeds the centered/contradictory edge cases (SPEC lines 182–188), which require *dimension-weighted* rather than *type-weighted* matching.

> **Tier 0 is the answer to "what's the minimum."** Eight axes + importance weights. Not the named Mantle type (the type is a *display* artifact; matching runs on the underlying vector — matching on the 10 type labels would throw away resolution and is the wrong primitive). Not Layer 2/3/4. A Layer-1-only user gets a real ballot, labeled lower-confidence.

### Tier 1 — Sharpening (after Layers 2 & 3, ~65–85%)
- **Layer 2 issue positions** — 8 issue stances. Used as *tie-breakers and confidence-boosters* on specific races where the issue is salient, and to corroborate the dimensional placement. Not a parallel matching system; they refine, they don't replace.
- **Layer 3 priority intensity** — converts the user's importance signal from "which axes" into "how hard." L3 also yields behavioral modifiers: character-vs-policy weight (L3-Q1), cross-party flip conditions (L3-Q2), electability tolerance (L3-Q3), and **downballot salience (L3-Q4)** — which directly tunes how aggressively we surface vs suppress thin down-ballot recommendations per user.

### Tier 2 — Hard constraints (after Layer 4, ~100%)
- **Dealbreaker set** — the user's selected subset of the ~29 Layer-4 filters, as a list of exclusion predicates. SPEC line 1213 is unambiguous: a candidate who crosses a line is excluded *regardless of dimensional score*. This is the only layer with veto power.

### Contract shape (conceptual)
```
MatchKey {
  profile:        DimensionalProfile        // Tier 0, required
  axisWeights:    Record<Dimension, number> // Tier 0, from L1 importance + L3 intensity
  axisConfidence: Record<Dimension, number> // Tier 0, derived from lean strength / "it depends"
  issuePositions: IssuePosition[]            // Tier 1, optional
  behaviorMods:   { characterWeight, electabilityTolerance, downballotSalience, ... } // Tier 1
  dealbreakers:   ExclusionPredicate[]       // Tier 2, optional
}
```
Everything past `profile` + `axisWeights` is optional; the engine must produce *something* with just those two, and must clearly down-rate its own confidence when the rest is absent.

---

## Matching method

Two stages, in strict order. The order is the whole point: filters are categorical, distance is continuous, and a continuous score must never be allowed to "buy back" a categorical exclusion.

### Stage 1 — Hard excludes (Layer 4)
For each candidate in the race, evaluate the user's dealbreaker predicates against the candidate record.
- **Any match → candidate is removed from the slate.** No partial credit, no discount, full exclusion (SPEC line 1213).
- A dealbreaker we **cannot evaluate** (no data on whether the candidate crosses the line) is *not* a pass. It is flagged: "We couldn't verify one of your dealbreakers for this candidate" — surfaced in the explanation, and it caps the recommendation's confidence. Silently passing an unverifiable dealbreaker would violate the product's core promise.

### Stage 2 — Weighted distance over survivors
Among surviving candidates, rank by closeness to the user in 8-space, but only over axes where **both** the user and the candidate are confidently placed.

For candidate *c* and user *u*, over the set `A` of jointly-scored axes:

```
score(c) = Σ_{a∈A}  w_a · conf_a^(cand) · (1 − |u_a − c_a| / 100)
           ─────────────────────────────────────────────────────
                       Σ_{a∈A}  w_a · conf_a^(cand)
```

- `w_a` — user axis weight (Layer 1 importance, intensified by Layer 3). Unflagged axes ~1.0; flagged axes higher. This is what SPEC means by "importance ratings act as weights" (line 1594).
- `conf_a^(cand)` — our confidence in the candidate's placement on axis *a*. Low-confidence axes contribute proportionally less, so a shaky placement can't dominate.
- `|u_a − c_a| / 100` — normalized per-axis gap. (Weighted Manhattan/cosine over normalized, confidence-masked axes is preferred to raw Euclidean here, because we want graceful behavior as `A` shrinks; the `classifyProfile` Euclidean form is fine for *type* assignment where all 8 axes are present, but not for sparse candidate matching.)
- The denominator normalizes by the weight actually *used*, so a 3-axis match and an 8-axis match yield comparable 0–1 scores — but the 3-axis match carries lower **confidence** (next section), which is reported separately and never folded into `score` itself.

**Layer 2 issue positions** enter as a bounded adjustment after the distance score on races where a position is directly salient (e.g., a stated user stance that exactly matches/opposes a candidate's known position), and as corroboration that raises confidence. They cannot, on their own, overturn the dimensional ranking by more than a capped margin — they sharpen, per SPEC.

**Output per race:** ranked survivors, each with `score` (0–1), `confidence` (band), the top contributing axes ("you align on Markets/Governance and Trust; you diverge on Stability/Change"), and the sources behind each load-bearing axis.

### Edge-case routing (SPEC lines 176–188)
For **centered** and **contradictory** profiles, fall back to *dimension-weighted* matching that leans only on the axes where the user actually scored away from 50 — which the formula above already does naturally via `axisConfidence` and the user-side lean. This is the engine behavior SPEC flags for those cases; it should be the same code path, not a special case.

---

## Down-ballot graceful degradation

The design principle: **degrade the confidence and the claim, never the honesty.** The same engine runs top-to-bottom; what changes is how much we say and how loudly.

### Confidence bands (composite signal)
Confidence on a recommendation is the *minimum-ish* of three independent factors — any one being weak caps the whole:
1. **Coverage** — how many of the 8 axes were jointly scored, and were any of them user-high-priority? A match missing the user's top-weighted axis is low-confidence even if 7 others align.
2. **Source quality/recency** — supplied by the data layer (out of scope here, but the band consumes it).
3. **Separation** — how far apart the top two survivors are. Two near-tied candidates → low confidence *even with rich data*, because the recommendation isn't robust.

Suggested presentation tiers:
- **Confident** — most axes scored incl. user's priorities, clear separation. "Recommended: ___, and here's why."
- **Lean** — partial axis coverage or modest separation. "Leans toward ___ on the dimensions we can see, but this is a lighter call."
- **Informational only** — 1–2 axes, or near-tie. Show the candidates and whatever placement we have, *withhold a pick*: "Here's what we found; not enough to recommend confidently."
- **No call** — no usable signal on any candidate. "We don't have enough to say about this race. Here's how to research it yourself." This is a designed, respectable outcome, not a failure — and it matches SPEC's FAQ promise (lines 1790–1791) to "tell you that honestly rather than guess."

### Partial recommendations
- Recommend on the **axes we have**, and *name the gap*: "We can place these candidates on Markets/Governance and Rules/Outcomes but found nothing on the other six — treat this as a partial read."
- Where Layer 2 issue positions are salient and a candidate's stance is known, a thin dimensional read can be *backed by* an issue match, raising it from "informational" to "lean."

### Per-user tuning via L3-Q4
The user's downballot salience answer (research-seriously / top-of-ticket / skip-uninformed) tunes the threshold at which we *show* low-confidence races vs collapse them: a "skip races I don't know enough about" user should see thin races defaulted to collapsed/"no call," while a "research seriously" user sees every partial read we have. Same data, different surfacing.

### Never do
- Impute missing axes to 50 to "complete" a candidate.
- Let a rich-data top-of-ticket model's confidence bleed into a sparse down-ballot race on the same ballot.
- Pass an unverifiable dealbreaker silently.

---

## Risks & open questions (design-level)

1. **Candidate-placement validity.** The whole pillar rests on projecting candidates into our 8-axis frame credibly and *nonpartisanly*. Who/what assigns the values, with what rubric, and how is it audited? A biased placement is indistinguishable from a biased recommendation. Needs a documented, published methodology (SPEC's transparency commitment demands it) and ideally inter-rater / spot-check validation.
2. **Non-ideological offices.** Judges, clerks, many nonpartisan local seats may not live on a values spectrum at all. Forcing them risks confident-looking nonsense. Open question: do we *exclude* whole office classes from values-matching and instead offer non-ideological guidance (incumbency, endorsements, qualifications)?
3. **The "50 = unknown" trap** (restated as a risk because it's the highest-leverage failure mode): any code path that defaults a missing axis to neutral will silently centrist-wash sparse candidates and produce confident false matches. This must be structurally impossible, not merely avoided.
4. **Dealbreaker evaluability.** Layer 4 is binary, but the underlying facts are often contested or unproven (e.g., "credibly accused," "documented pattern of lying"). What standard of evidence triggers an exclusion, and how do we avoid both over-excluding (rumor) and under-excluding (whitewashing)? This is as much an editorial-policy question as an engineering one.
5. **Rhetoric-vs-record weighting** is a model parameter with real partisan consequences (incumbents have records; challengers have rhetoric). Mis-set, it could systematically favor one side. Needs an explicit, defensible rule.
6. **Score vs confidence conflation.** Strong design discipline required to keep `score` (how well-aligned, *given what we know*) separate from `confidence` (how much we know). Users will read a high score on thin data as a strong endorsement unless the UI rigorously separates them.
7. **Importance-weight expressiveness.** Up-to-3 binary "most central" flags is a coarse weighting input; Layer 3 intensity helps, but whether 3 flags + intensity captures enough nuance to meaningfully differentiate recommendations (vs. everyone effectively getting near-uniform weights) is worth validating before build.
8. **Demographic/lineage interaction (SPEC Open Q#17, lines 1921/1253).** Whether and how optional political-lineage data touches candidate matching is explicitly unresolved and flagged; this memo assumes it does **not** enter the distance computation. Confirm before build.
9. **Tie / near-tie UX.** Separation-driven confidence means many honest "it's close" outcomes. The product needs a genuinely good story for "these two are basically tied for you" rather than forcing a coin-flip pick.
10. **Provenance burden.** Every load-bearing axis needs a citation for the explanation to be real. If placement is partly model-inferred rather than directly sourced, the "show our work" promise gets harder — what counts as a citable basis for an axis value?
