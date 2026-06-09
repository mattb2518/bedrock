# Bedrock Brand Guidelines
*Version 1.0 — Locked June 2026*
*Source of truth: docs/brand-guidelines.md in github.com/mattb2518/bedrock*
*For CSS implementation values, see src/styles/tokens.css*

---

## 1. What Bedrock Is

A civic identity platform for independent-minded voters. Not a party voter guide. Not a polling tool. Not an advocacy organization.

**Mission:** Help independent-minded citizens understand, articulate, and act on what they actually believe — because democracy works better when more people show up with clarity and conviction rather than confusion and indifference.

**The one-liner:** Your values. Your ballot. Your media diet. All in one place.

**Founder:** Matt Blumberg — technology entrepreneur, civic institutionalist, creator of the Country Over Self podcast. "I'm not red. I'm not blue. I'm red, white, and blue."

---

## 2. Audience

**Primary:** Independent-minded voters — registered independents and soft partisans who don't vote the straight ticket. The largest and fastest-growing voter segment. Highly engaged but underserved by every existing civic tool.

**Who this is not for:** Voters who want their existing tribal identity confirmed. People looking for a red team or blue team voter guide.

**The emotional truth of the target user:** Frustrated that the system treats them like they don't exist. Smart enough to know both parties are oversimplifying. Wants to do the right civic thing but finds the tools either partisan or useless.

---

## 3. Brand Name & Domains

**Name:** Bedrock

**Why:** Your values are your bedrock — the foundation everything else rests on. Solid. American. Non-partisan. Zero political baggage.

**Domains:**
- bedrock.guide — primary
- bedrock.vote — companion
- bedrock.guide at Cloudflare; bedrock.vote at Network Solutions (Cloudflare SSL/routing on both)

**Not the same as:** bedrock.us (a different organization — different mission, different domain, no confusion on sight).

---

## 4. Visual Identity

### Design Aesthetic
Stripe/Linear quality for civic tech. Refined, modern, nonpartisan. Serious purpose — enjoyable to use.

**Anti-patterns:** Government website aesthetic. BuzzFeed quiz energy. Anything that reads as red team vs. blue team.

### Color System — The Tri-Color Approach
Red, white, and blue — used as a unified American system, never as opposing partisan teams. This is the conceptual heart of the visual identity.

**Primary backgrounds (dark canvas):**
- Page background: `#1A2D45` — deep blue-navy, reads as navy not black
- Section alternate: `#132238` — slightly deeper for contrast between sections
- Card surfaces: `#1E3350`

**Tri-color brand palette:**
- Crimson: `#D44035` — used for emphasis, never to mean "Republican"
- Off-white: `#E8E4DA` — warm white, primary text on dark backgrounds
- Blue: `#6B9FEA` — used for accent, never to mean "Democrat"
- Gold: `#C8A96E` — italic/editorial emphasis in headlines

**Text hierarchy on dark backgrounds:**
- Primary: `#E8E4DA`
- Secondary: `#B8B4AC`
- Muted: `#888480`
- Subtle: `#585450`
- Disabled: `#383430`

**Interactive / UI:**
- CTA / primary button: `#D44035` (crimson)
- Links: `#6B9FEA` (blue)
- Focus ring: `#C8A96E` (gold)
- Success: `#4CAF82`
- Warning: `#E8A030`
- Error: `#E84040`

### Logo & Mark
**The mark:** A tri-color mountain/strata symbol — three horizontal layers in red, white, and blue suggesting bedrock geological layers. Reads as both geological foundation and American flag colors. Never red on left / blue on right (avoids partisan team read).

**The wordmark:** "Bedrock" set in Libre Baskerville, tracked slightly. The mark sits to the left of the wordmark.

**Lockup:** Mark + wordmark horizontal for nav and headers. Mark alone for favicon and small sizes.

**Color on dark background:** Mark uses gradient from crimson through off-white to blue. Wordmark in `#E8E4DA`.

### Typography
**Display / headlines:** Libre Baskerville (serif) — signals gravitas and civic authority without stuffiness. Used for hero headlines, section titles, civic type names.

**Body / UI:** DM Sans — clean, legible, modern. Used for body copy, UI elements, quiz questions, navigation.

**Both available via Google Fonts.**

**Type scale:**
- Hero display: 68px / tight leading
- H1: 48px
- H2: 36px
- H3: 24px
- H4: 20px
- Body large: 18px
- Body: 16px
- Small / caption: 14px
- Micro: 12px

**Never:** Comic Sans, anything that reads as playful/casual, system fonts in display contexts.

### Hero Headline System
The homepage hero uses a rotating tri-color headline system. Three lines, each a different color:

```
Your values.          ← crimson
Your ballot.          ← off-white  
Your call.            ← blue
```

The third line rotates through variants ("Your call." / "Your voice." / "Your bedrock.") with a smooth crossfade. The word "Your" repeats intentionally — it's the brand's core assertion that this is about the user, not a party.

### Spacing & Layout
- Generous whitespace — this is not a dense information site
- Card-based candidate profiles
- Progress indicators that feel satisfying, not clinical
- Quiz feels like well-designed product onboarding, not a survey form
- Mobile-first layout — many users will complete this on their phone

---

## 5. Voice & Tone

### The Product Voice
Bedrock talks like a knowledgeable, nonpartisan civic friend — not a professor, not a party operative, not a bureaucrat.

**Core voice attributes:**
- **Confident but not preachy.** Takes a point of view but never lectures.
- **Smart but accessible.** Assumes the user is intelligent. Doesn't over-explain.
- **Warm but not cheesy.** Cares about civic participation without being saccharine.
- **Nonpartisan by design.** Language never advantages one side. Both parties get equal (often skeptical) treatment.

### Writing Principles (Matt's Voice Applied to Product)
- **Open with the conclusion.** Don't build to it.
- **Short declarative sentences** for emphasis — stand alone as their own paragraph when needed.
- **Name the thing directly** before explaining it. "Here's what this means" not "It has been observed that..."
- **Both things are true.** Use "and" framing for tensions, not "but."
- **Never survey language.** "Where do you land?" not "Please indicate your preference."
- **Endings land clean.** Punchy final line. No trailing qualifications.
- **Mild irreverence is fine.** Don't be stiff. Civic doesn't mean humorless.

### Recurring Motif
**"There's got to be a better way."** — Used across pages as a recurring refrain that completes differently by context. It's the emotional truth of why Bedrock exists.

### Emotional Register
Frustrated-but-constructive. Optimistic and forward-looking. Not angry, not resigned. The energy of someone who still believes the system can work — and is building the tool to prove it.

### What Not to Say
- Don't say "we'll tell you how to vote" — say "we help you vote the way you actually believe"
- Don't use partisan framing (left/right, liberal/conservative as pejorative)
- Don't be clinical or survey-like ("please select all that apply")
- Don't overclaim data coverage — be honest about gaps
- Don't use "progressive" or "conservative" as identity labels in UI copy

---

## 6. Country Over Self Connection

The Country Over Self podcast (countryoverself.com) is Bedrock's origin story and credibility credential. Founded by Matt Blumberg. Built around the philosophy "I'm not red, I'm not blue — I'm red, white, and blue."

**How it surfaces on the site:**
- About page — explicit origin story
- Trust & Methodology — credibility signal
- Tagline resonance — the red/white/blue framing belongs to Matt, predates Bedrock
- "From the creator of Country Over Self" — attribution language, not the platform name itself

---

## 7. Nonpartisan Credibility — Non-Negotiable

Nonpartisan credibility is load-bearing. Every design, copy, and data decision must hold up to scrutiny from both sides.

**Tests to apply:**
- Would a sophisticated critic from the left see this as biased? From the right?
- Does this question, example, or framing make one answer feel like the "correct" one?
- Does this data source have a partisan lean that should be labeled?

**Data provenance convention:** When a data source has known partisan lean, apply a label (e.g., "data from a source with known partisan ties — we use it for factual race information only"). Transparency over silence.

**Media recommendations:** Three-tier model — confirming sources (matches user's values), expanding sources (adjacent perspectives), challenging sources (genuine counterpoint). Never just echo chamber reinforcement.

---

## 8. Product Commitments (Non-Negotiable)

- Plausible Analytics only — no Google Analytics, no exceptions
- Exactly two cookies
- No third-party tracking scripts
- Open-source scoring logic on GitHub
- Account deletion: one-click, permanent
- Profile export as plain text
- Data source transparency — always show sources, always explain recommendations

---

## 9. Competitive Positioning

**Closest competitor:** VoteMate (votemateus.org) — AI-powered, Ballotpedia-partnered, nonprofit. Conversational chat interface. Does not do values quiz → ballot recommendation → printable guide.

**What makes Bedrock different:**
- Quiz-to-ballot-to-media pipeline (not just one of those)
- Dimensional values model (not issue-position matching)
- Printable ballot guide output
- Founder with documented civic credibility
- Design quality that signals legitimacy

**iSideWith, VOTE411, Ballotpedia:** Data sources and partial competitors. Bedrock integrates with them, doesn't replace them.

---

## 10. Tech Stack (for reference)

Next.js, Tailwind CSS, Framer Motion, Zustand, Claude API (Sonnet), Google Civic Information API, OpenStates API, VoteSmart, OpenSecrets free tier, Ballotpedia (pending licensing), Plausible Analytics.

---

*Document status: Version 1.0 — locked June 2026.*
*For CSS implementation values, see src/styles/tokens.css.*
*For full product spec, see SPEC.md.*
