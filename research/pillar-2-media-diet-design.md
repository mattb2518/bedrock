# Pillar 2 — Your Media Diet: Design Memo

*Design research. Author: research session. Date: 2026-06-11.*
*Status: design-half scoping for "Your Media Diet" (SPEC.md lines 42–43, 1463, 1803–1816). Not a build spec.*

> **Scope note.** The factual-dataset half of this work — AllSides / Ad Fontes licensing, current pricing, terms, coverage — is being handled in a separate web-enabled tool. This memo deliberately does **not** speculate on third-party data terms. It covers only the design questions that need no internet: the labeling schema, the three-tier matching math, the minimum quiz output required, the editorial curation workflow, and the design-level risks. SPEC carries the corresponding open flags at lines 1242, 1250, 1813.

---

## Summary (5 bullets)

- **Simple left/right + reliability is not enough.** Bedrock's whole thesis is that one axis is "actively misleading" (SPEC line 1508). The media catalog must be tagged in the *same* 8-dimension language as the user profile, plus a handful of catalog-only fields (reliability, independence, format, dimension-coverage). The proposed schema has four blocks an editor can actually fill in: **Identity**, **Position** (the 8 axes + a coarse lean), **Quality** (reliability, independence, transparency), and **Coverage** (which dimensions the source treats rigorously, plus format/cadence).
- **The three tiers are a hybrid: distance in the shared 8-D space, gated by quality and coverage, then editorially bucketed.** Pure distance is necessary but not sufficient — a far-away source that is low-reliability or off-topic is noise, not a challenge. Tiers are assigned by a *vector relationship* to the user, not by absolute position.
- **"Expanding" and "challenging" are different and must not be conflated.** **Expanding = same broad direction, new ground** — a source the user broadly agrees with on its strong axes but that covers *dimensions the user's confirming sources ignore*, or covers them more deeply. It widens the aperture without triggering defensiveness. **Challenging = genuine disagreement, high quality** — a source that lands on the *opposite* side of the user's most-held dimensions, but clears a high reliability/good-faith bar so the disagreement is honest rather than tribal. Expanding grows the map; challenging contests it.
- **The minimum matching key is lighter than Ballot's.** Media diet needs essentially **Layer 1 only**: the 8 dimension scores, the primary (and secondary) Mantle type, and the user's top-3 most-held dimensions. It does **not** need L2 issue positions, L3 priority intensity, or L4 dealbreakers. (Contrast Ballot, which needs all four layers including dealbreaker exclusion rules.) This means the media diet can render meaningfully at ~40% completion.
- **Curation of independents is the hard, human part and the main risk surface.** Independent creators are unlabeled anywhere, so Bedrock will be *creating* labels that read as judgments about real people. The workflow below uses a written rubric, two-rater independent tagging with reconciliation, a structural even-handedness check (balanced challenger pools per Mantle), source-evidence requirements, a published methodology, a creator right-of-reply, and a quarterly refresh — all designed to keep Bedrock's own bias out of the labels.

---

## 1. Labeling taxonomy

**Question: is left/right + reliability enough?** No. Two reasons.

1. **It contradicts the product's core claim.** Bedrock tells users that collapsing political identity to one axis "loses almost everything that matters" (SPEC line 1508). If the user is modeled in 8 dimensions but the media catalog is modeled in 1, the match degrades to "find sources near your left/right midpoint," which is exactly the flattening the product exists to reject. The catalog must speak the same language as the profile.
2. **The three tiers need richer signal than position alone.** "Expanding" depends on *coverage* (what a source talks about), and "challenging" depends on *quality* (whether a disagreement is in good faith). Neither is expressible in lean + reliability.

So we tag every outlet/creator in four blocks. The design constraint throughout: **every field must be something a trained editor can apply from published work, with a written definition and an evidence note** — no field may require mind-reading.

### Block A — Identity (descriptive, low-judgment)
| Field | Type | Notes |
|---|---|---|
| `name` | string | Outlet or creator name |
| `kind` | enum | `journalist` / `substack` / `podcast` / `outlet` / `newsletter` / `youtube` |
| `independent` | bool | Is this an independent creator vs. an institutional outlet? Pillar 2 is *independent*-first; institutional outlets may be tagged but flagged. |
| `primary_url`, `handles` | string | Where to send the user |
| `active` | enum | `active` / `dormant` / `retired` — drives refresh |

### Block B — Position: the 8 axes (the load-bearing block)
The source is scored on the **same eight dimensions as the user**, each **0–100, same polarity** as `dimensions.ts` (0 = pole A, 100 = pole B). This is what lets the source and the user live in one shared space.

- For each of the 8 axes the editor records `score (0–100)` and a `confidence` (`strong` / `weak` / `n-a`). `n-a` means "this source doesn't engage this axis" — important, and different from "centered."
- Crucially, a source is scored on **how it reasons, not just its conclusions.** A source can be Change-leaning on `stability_change` while being Trust-leaning on `trust_skepticism`. This is the whole point of using the 8-D model: independent creators rarely sit cleanly on a party line, which is precisely why Bedrock's audience likes them.
- Plus one **coarse partisan lean** field, `lean ∈ {left, lean-left, center, lean-right, right, heterodox}`, sourced from established research (AllSides-style) where it exists. This is a *sanity cross-check and a display label*, not the matching key. `heterodox` is a first-class value — many independents are genuinely not placeable on left/right, and forcing them onto it would reintroduce the flattening error.

### Block C — Quality
| Field | Type | Notes |
|---|---|---|
| `reliability` | 0–100 | Factual rigor / sourcing. Seed from established research (Ad Fontes-style) where available; otherwise editor-rated against the rubric. |
| `independence` | 0–100 | Freedom from party/PAC/advertiser capture. Directly serves the "independent journalism" promise. |
| `good_faith` | enum | `high` / `mixed` / `low` — does the source argue in good faith and represent opponents fairly? **This is the gate for the challenging tier.** |
| `transparency` | 0–100 | Discloses funding, corrections, conflicts. |

### Block D — Coverage & format
| Field | Type | Notes |
|---|---|---|
| `dimension_coverage[]` | list of `{dimension, depth}` | Which of the 8 dimensions this source treats **rigorously** (depth `signature` / `regular` / `incidental`). This is the field that makes "expanding" computable. SPEC line 1812 already commits to "our own dimension coverage tags." |
| `topics[]` | tags | Free-but-controlled vocabulary (economy, foreign policy, civil liberties, local…) for display/filtering. |
| `format` | enum | longform / daily / weekly / audio / video — used to balance the *delivered* diet, not the match. |
| `effort` | enum | `light` / `medium` / `deep` — lets the UI mix a quick daily read with a deep weekly. |

### Provenance fields (every record)
`tagged_by`, `reviewed_by`, `source_evidence[]` (links to specific pieces justifying the scores), `external_refs` (AllSides/Ad Fontes ids where used), `last_reviewed`, `methodology_version`. These exist so every label can be defended and audited — non-negotiable when you're labeling real people.

**Net:** richer than left/right + reliability, but only by ~3 blocks beyond the 8 axes, and every field is editor-applicable with an evidence trail.

---

## 2. Three-tier computation (with confirming / expanding / challenging defined precisely)

**Recommended approach: a hybrid — shared-space vector geometry, gated by quality/coverage, then editorially bucketed per Mantle.** Not pure distance (it can't tell expanding from challenging, and it surfaces high-distance junk). Not pure per-Mantle editorial buckets (they don't personalize to the user's *individual* constellation, only their type). The hybrid uses geometry to personalize and editorial buckets to guarantee quality and balance.

Let the user profile be `U` (8-vector, 0–100) and a source be `S` (8-vector, with per-axis confidence). Define, **over the axes the source actually engages** (skip `n-a` axes):
- `agreement(U,S)` = how close U and S are overall (inverse of normalized Euclidean distance across engaged axes).
- `tension_on_held(U,S)` = signed distance specifically on the user's **top-3 most-held dimensions** (from the quiz's 21st "which matter most" item). This is the key that separates *challenging* from merely *different*.
- `novel_coverage(U,S)` = the source's `dimension_coverage` on dimensions that the user's likely-confirming set covers thinly. This is the key for *expanding*.

### Precise tier definitions

**Confirming — "deepen what you know."**
Sources that **broadly agree** with the user, especially on the dimensions they hold most strongly, and clear a baseline reliability bar.
> Formal: high `agreement`, low `tension_on_held`, `reliability ≥ floor`.
> Job: depth and articulation — sources that say what the user already believes, but better and with better evidence. (SPEC: "deepen what you know," line 1463.)

**Expanding — "expand how you think."**
Sources in the **same broad direction** as the user (not adversarial) that take them onto **ground their confirming sources ignore** — new dimensions, new topics, or far more depth on a dimension the user cares about but reads thinly.
> Formal: moderate `agreement` (not opposed on held axes — low/medium `tension_on_held`), **high `novel_coverage`**, `reliability ≥ floor`.
> Job: widen the aperture without triggering defensiveness. The user isn't being told they're wrong; they're being shown a part of the map they hadn't looked at. (SPEC: "expand how you think.")

**Challenging — "challenge you where it counts."**
Sources that **genuinely disagree** with the user on the dimensions they hold **most strongly**, and that clear a **high** bar on reliability, good-faith, and independence so the disagreement is honest.
> Formal: **high `tension_on_held`** (opposite pole on the user's top dimensions), AND `reliability ≥ high_floor` AND `good_faith = high` AND `independence ≥ floor`.
> Job: an honest, high-quality dissent the user has to actually reckon with. (SPEC: "challenge you where it counts," line 1463.)

### The expanding-vs-challenging distinction, stated plainly
They are easy to conflate because both move the user away from pure confirmation. The difference is **direction relative to the user's held values**:
- **Expanding moves sideways/forward** — same broad direction, *new* dimensions or depth. It grows the map. It rarely says "you're wrong."
- **Challenging moves opposite** — *contested* dimensions, head-on. It contests the map. It says "here's the best case against you."

A useful test: an *expanding* source could be summarized to the user as "this covers something your other sources skip"; a *challenging* source is summarized as "thoughtful people who land opposite you read this." If a candidate source fits both summaries, default it to **expanding** (lower defensiveness, higher engagement) and reserve **challenging** for sources whose disagreement is on a **top-3 held** axis. The held-axis gate is what keeps challenging from degrading into "random opposite-team content."

### The hybrid pipeline (per user, per refresh)
1. **Candidate set** = catalog filtered to `active`, `reliability ≥ floor`, `independent` preferred.
2. **Score** each source's `agreement`, `tension_on_held`, `novel_coverage` against U.
3. **Gate**: drop sources failing the tier's quality bar (esp. the high bar for challenging).
4. **Bucket** into the three tiers by the rules above.
5. **Diversity pass** within each tier: enforce format mix (not all podcasts), topic spread, and — in *challenging* — that the dissent isn't all from one direction/source-cluster (you don't want "challenge" to mean "here is the other party," which would re-flatten to left/right).
6. **Editorial floor (the per-Mantle buckets)**: for each of the ten Mantle types, editors pre-curate a small hand-picked seed list per tier. If geometry produces a thin or lopsided tier for a given user, fall back to the Mantle seed list. This guarantees every user gets a credible, balanced diet on day one even before the catalog is large (addresses SPEC open item line 1242, "how many sources at launch").
7. **Render** a handful per tier (start ~3–5/tier), each with a one-line *why this tier* explanation, mirroring the Ballot pillar's "explain why / show your work" ethos.

---

## 3. Minimum matching key (lighter than Ballot — confirmed)

**The media diet needs Layer 1 almost entirely, and nothing from L2/L3/L4.** This is materially lighter than Ballot, which needs all four layers including L4 dealbreakers as hard exclusion rules.

The contract between quiz output and the media engine:

| Field | Source layer | Why the media engine needs it |
|---|---|---|
| `dimension_scores[8]` (axis, pole labels, 0–100) | L1 | The user vector `U`. The entire match runs in this space. |
| `top_dimensions[≤3]` (user-nominated most-held) | L1 (21st item) | Defines `tension_on_held` — the line between *expanding* and *challenging*. The single highest-value field. |
| `primary_type` + `secondary_types[1–3]` | L1 | Drives the per-Mantle editorial seed lists and the fallback floor. |
| `edge_case_flag` (centered / scattered / near-pure) | L1 | A near-pure user needs a stronger challenging tier to avoid an echo chamber; a centered user already spans poles and needs less forced balance. |
| `completeness_pct` | L1–L4 | Calibrates UI confidence; lets the diet render at ~40% (post-L1) with a "get sharper" nudge. |

**Explicitly not required:**
- **L2 issue positions** — concrete stances aren't needed to position a *source*; the 8-D vector is enough. (Optional future enrichment: match a source's `topics` to issues the user actually engaged.)
- **L3 priority intensity** — `top_dimensions` from L1 already supplies the "what matters most" signal the tiers need.
- **L4 dealbreakers** — these are *ballot exclusion* rules. Importing them here would be actively harmful: filtering media by the user's hard lines is the definition of an echo chamber, the exact failure mode SPEC line 1809 warns against. **Dealbreakers must not touch the media engine.**

**So: yes, lighter than Ballot — Layer 1 only.** Practical consequence: the media diet is a strong reason to complete L1 and renders meaningfully before the user does L2–L4.

---

## 4. Curation workflow for independents

Independent creators are unlabeled in AllSides/Ad Fontes-style datasets, so Bedrock will be **originating** labels about real people. That makes the workflow both a quality system and Bedrock's biggest reputational exposure. Design goals: even-handed, auditable, bias-resistant, and refreshable.

### 4.1 The rubric (what an editor actually fills in)
A written scoring guide, versioned (`methodology_version`), with for **each** of the 8 axes and each quality field: a definition, a 0–100 anchor scale with worked examples, and a required `source_evidence` note citing **specific published pieces** (≥3 recent items) that justify the score. **No score without evidence.** The rubric scores **reasoning and framing, not just conclusions** — the differentiator vs. left/right tagging. It explicitly instructs raters to score the *body of work*, not a single viral piece, and to mark `n-a` honestly when a source doesn't engage an axis.

### 4.2 Who tags, and how to stay even-handed
- **Two-rater independent tagging.** Two trained raters score each source **blind to each other**. Disagreements beyond a threshold go to a **reconciliation** step (a third reviewer or a discussion logged in the record). Inter-rater agreement is tracked as a quality metric; persistent low agreement on a field means the rubric is ambiguous and needs revision.
- **Ideologically balanced rater pool.** Recruit raters who self-describe across the spectrum (and `heterodox`). The point isn't to cancel out bias by averaging; it's to surface it — if left- and right-leaning raters systematically score the same source differently, that gap is *data* about the source being polarizing, and it gets flagged, not buried.
- **Seed from external research where it exists.** For sources AllSides/Ad Fontes already cover, import their lean/reliability as a **prior** and require the editor to justify any large deviation. This anchors Bedrock's novel labels to established, defensible baselines and shrinks the surface where Bedrock's own bias can creep in. (Independent-only sources, by definition, won't have this anchor — flag them `bedrock_originated` for extra review.)

### 4.3 How to avoid *our own* bias (structural, not aspirational)
- **Structural balance check per Mantle.** For each of the ten Mantle types, audit the **challenging** pool: it must contain credible, high-reliability dissent from *more than one direction* and must not collapse to "the opposing party's media." If a Mantle's challenge pool is one-directional, that's a curation bug. This is the concrete mechanism that operationalizes SPEC line 1809 ("deliberately balanced media diet") and the founder's "structural, not cosmetic" nonpartisan commitment (SPEC line 26).
- **No score from vibes.** Every label is defensible from the `source_evidence` links or it doesn't ship.
- **Founder-conflict rule.** The founder hosts *Country Over Self* (SPEC line 24). Bedrock-affiliated properties must be tagged by the standard two-rater process **and** clearly disclosed when surfaced, never hand-promoted into a tier. Self-dealing here would torch the nonpartisan credibility the product is built on.
- **Right of reply.** A creator who believes their label is wrong can contest it; contested labels get re-reviewed against the evidence. This both improves accuracy and reduces liability (see §5).

### 4.4 Catalog growth & the user suggestion loop
SPEC line 1816 already commits to a user suggestion mechanism. Suggestions enter a **queue**, not the live catalog — each goes through the same two-rater rubric before appearing. This grows coverage of long-tail independents (the audience's favorites) without letting users brigade the labels.

### 4.5 Refresh cadence
- **Quarterly full review** of `active` sources (positions and quality drift as creators evolve; this is acute for independents).
- **Event-triggered re-review** when a source materially changes (relaunch, major reliability incident, funding change).
- **Dormancy sweep** each cycle: mark inactive sources `dormant`/`retired` so the diet stays live.
- Every change bumps `last_reviewed` and is attributed — the catalog is an auditable record, not a black box.

---

## 5. Risks & open questions (design-level)

**Risks**
- **Liability / reputational risk of labeling real creators.** Calling a named independent "low good-faith" or pinning them to a pole is a public judgment about a real person and a defamation-adjacent surface. *Mitigations:* evidence-backed labels only; published methodology; right-of-reply; frame outputs as *recommendations for this user* ("thoughtful people who land opposite you read this"), not as objective verdicts on the creator.
- **Echo chamber vs. forced-balance tension.** Over-confirm and you make "a worse citizen" (SPEC line 1809); over-force balance and you feel preachy, insert low-quality "other side" content, and users disengage — or you re-flatten "challenge" into "the opposing party." *Mitigations:* the held-axis gate (challenge only on top-3 dimensions), the high-quality gate on challengers, `edge_case_flag` to tune how hard to push per user, and never letting L4 dealbreakers filter media.
- **Bedrock imposing its own worldview through the rubric.** Whoever writes the axis anchors encodes a viewpoint. *Mitigations:* versioned public methodology, ideologically balanced two-rater pool, external-research priors as anchors, per-Mantle balance audits.
- **"Independent" is fuzzy and gameable.** Creators can perform independence while being captured. *Mitigation:* the `independence` + `transparency` fields plus funding-disclosure evidence requirements.
- **Small-catalog cold start.** Early on, geometry over a thin catalog yields lopsided tiers. *Mitigation:* the per-Mantle editorial seed lists as a guaranteed floor (§2 step 6).
- **Cross-pillar leakage.** If dealbreakers or ballot exclusions bleed into media, the diet becomes a filter bubble. *Mitigation:* hard architectural separation — media engine reads L1 only.

**Open questions**
- **Launch catalog size and per-Mantle minimums** — how many sources, and what's the minimum viable challenging pool per Mantle before a user sees the tier? (SPEC open item, line 1242.)
- **How many sources to surface per tier**, and whether the user can resize tiers (e.g., "give me more challenge").
- **Licensing/derived-data terms** for using AllSides/Ad Fontes scores as seeds vs. displaying them — *being resolved in the web-enabled track; flagged here as a dependency, not answered* (SPEC lines 1250, 1813).
- **Do we ever score *institutional* (non-independent) outlets**, or strictly independents? Pillar is independent-first, but a few anchor outlets may help calibrate the scale.
- **Heterodox handling in the UI** — how to display a source that genuinely doesn't sit on left/right without confusing users trained to expect a lean.
- **Feedback signal** — should "I liked / dismissed this source" tune future recommendations, and if so, how to prevent that feedback from quietly collapsing the diet back into pure confirmation?
- **Catalog/model drift** — the live `mantles.ts` currently defines **9** Mantle profiles while the type union and SPEC say **ten**; per-Mantle editorial seed lists need the full ten settled first. (Noted as a build dependency, not a Pillar-2 design decision.)
