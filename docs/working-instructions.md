# Bedrock — Working Instructions

## How This Project Operates

### Three-way workflow

**Claude Project (claude.ai)** — design, spec, content
All product thinking, question writing, copy, architecture decisions, and spec updates happen here. This is where Bedrock gets designed. When a section is complete, the spec gets pushed to GitHub.

**Claude Code** — build only
Reads SPEC.md from GitHub as its source of truth. Makes implementation decisions, not product decisions. When it hits an open question from SPEC.md Section 16, it raises it with Matt and the answer gets decided in the Claude Project, then the spec gets updated before Claude Code proceeds.

**GitHub (github.com/mattb2518/bedrock)** — single source of truth
SPEC.md is the document both Claude Project and Claude Code work from. Always push spec changes to GitHub before starting a Claude Code session. Always note any implementation decisions Claude Code makes that should be reflected in the spec.

---

### Spec-sync rule
Any change to shipped content or counts in code (quiz questions, dealbreaker items, catalog logic, page copy) must update the corresponding SPEC.md section in the same session. Spec and code must not diverge across sessions.

### Sync rule
Before switching from Claude Project to Claude Code → push latest spec to GitHub.
Before switching back to Claude Project → note any implementation decisions worth capturing in the spec.
Within a single Claude Project session → commit spec changes to GitHub at each natural checkpoint (after completing a section, after a batch of approved edits), not just at session end. Prevents local-vs-remote divergence in longer sessions.

---

### Token and secrets
- GitHub token lives in `.env.local` at the project root (created during scaffolding)
- `.env.local` is gitignored — never committed
- All environment variables listed in SPEC.md Section 17
- Never put tokens in prompts

---

### Operational notes — reading the repo from a Claude chat

- **Use the raw endpoint, not the GitHub REST API.** When a Claude cloud Project (not Claude Code) fetches repo files, use `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`. The unauthenticated REST API allows only 60 requests/hour per IP, shared across the whole environment — it throws intermittent 403s that look like connection failures but are really rate limits. The raw endpoint isn't subject to that limit.
- **Caveat: raw caches aggressively.** A raw 200 can be returned for a branch or path that no longer exists. Use `git ls-remote <repo-url>` as the authority on which branches actually exist — never trust a raw 200 for that.

---

### Open questions (SPEC.md Section 16)
Unresolved design decisions live in Section 16. Claude Code must flag these and not resolve them independently. Decisions come back to the Claude Project.

---

### Model-tier sessions
1. ~~Recommendation engine logic~~ — **done (2026-06-29):** specced in a heavyweight session. See SPEC.md §19.
2. ~~**Full bias and competitive landscape check**~~ — **COMPLETE (2026-07-03).** Ran the complete quiz set + methodology copy + media-catalog Partisan Lean flags + governance filter through Opus. Two revisions adopted (dealbreaker exception in scorecard FAQ; data-honesty hedge in officials coverage note). Tracked in §21.9 checklist.

---

## Starting a new Claude Project chat

Paste this prompt:

---

I'm continuing work on **Bedrock** — a civic identity platform for independent-minded voters at bedrock.guide and bedrock.vote.

Before we start, read these three documents from GitHub:
- **SPEC.md** — master product spec (quiz, type system, brand, all three pillars)
- **DECISIONS.md** — log of all decided questions and deferred items
- **docs/data-sources-feasibility-june2026.md** — authoritative, web-verified reference for all external data sources; governs all data-integration work

Where we are (June 2026, updated 2026-06-29):
- Quiz: complete and live
- Brand and visual identity: locked
- Auth/accounts: built (email/password, Google OAuth, magic link; signup, password reset, email confirmation)
- Pillar — Your Conversations: **complete**, in user testing. All three modes shipped (Start one / Respond to one / Back-and-forth live chat). See SPEC.md §18.
- Recommendation engine: **specced** (SPEC.md §19) — ready to build
- Classification pipeline: **specced** (SPEC.md §20)
- Admin tool: **specced** (SPEC.md §21)
- Your Ballot: **specced** (SPEC.md §22)
- Beyond Your Ballot: **specced** (SPEC.md §23)
- Your Media Diet + Article Bias Checker: **specced** (SPEC.md §24/§24b); 60-source catalog committed at `src/data/media-catalog.csv`
- Methodology / FAQ / Privacy pages: **specced** (SPEC.md §25/§26/§27)
- Supabase persistence: **approved** (`docs/supabase-persistence-plan.md`) — ready to build

What's next (in order):
1. ~~**Bias + competitive landscape check**~~ — **COMPLETE (2026-07-03).** See §21.9.
2. **Long-lead outreach (start now):** Ballotpedia licensing (data@ballotpedia.org), Ad Fontes pricing (info@adfontesmedia.com), AllSides non-commercial eligibility (partnerships@allsides.com). See `docs/api-setup.md`.
3. **Build** — everything else is specced; hand to Claude Code in the build order in that session's prompt below.

Working conventions:
- After completing each section, push spec updates to GitHub (checkpoint commits, not batched)
- Run a bias check before showing any new question drafts
- Flag complexity creep — known tendency toward over-engineering
- Read feasibility doc before any data-source or scoring work — it supersedes SPEC.md's tech stack notes where they conflict, and names two dead APIs (Google Civic Representatives, ProPublica Congress) with their replacements

Start by reading the three docs above, note anything that needs reconciling, then let's tackle the next item.

---

## Starting a Claude Code session

Paste this prompt:

---

I'm building **Bedrock** (bedrock.guide / bedrock.vote) — a civic identity platform for independent-minded voters, built for public scale.

Read these before advising on anything:
- **SPEC.md** — master spec (quiz, type system, brand, all three pillars, system prompt)
- **DECISIONS.md** — all decided questions and deferred items; check before raising a question that may already be answered
- **docs/data-sources-feasibility-june2026.md** — authoritative data-source reference; supersedes SPEC.md's tech stack notes where they conflict. Two APIs in the spec are dead — this doc names replacements.

Environment and infrastructure (already settled — do not re-litigate):
- **OS:** Windows 11
- **Framework:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Zustand
- **Hosting:** Vercel
- **Database:** Supabase (dedicated instance)
- **AI:** Anthropic Claude API (`claude-sonnet-4-6` for Conversations and classification; the matching engine itself is a pure function, no model)
- **Analytics:** Plausible only — no Google Analytics, no exceptions
- **DNS:** Cloudflare (bedrock.guide and bedrock.vote)
- **Repo:** github.com/mattb2518/bedrock

Where we are (June 2026, updated 2026-06-29):
- Quiz: complete and live
- Brand and visual identity: locked
- Auth/accounts: built (email/password, Google OAuth, magic link)
- Your Conversations: **complete**, in user testing. Three modes; Back-and-forth is a full live chat with per-turn coaching, print transcripts, session management. See SPEC.md §18.
- Everything else is **specced and ready to build**: recommendation engine (§19), classification pipeline (§20), admin tool (§21), Your Ballot (§22), Beyond Your Ballot (§23), Your Media Diet + Article Bias Checker (§24/§24b), Methodology/FAQ/Privacy (§25/§26/§27).
- 60-source media catalog committed at `src/data/media-catalog.csv`. API setup steps in `docs/api-setup.md`. Supabase persistence plan approved (`docs/supabase-persistence-plan.md`).

Build sequence (in order — confirmed 2026-06-29):
1. **Supabase persistence** — wire `quiz_profiles` per the approved plan (local-first → account merge). Foundation for everything that reads a saved profile.
2. **Recommendation engine** — `src/lib/engine/match.ts` (pure function; two-stage pipeline per §19), plus `src/lib/engine/mediaMatch.ts`.
3. **Classification pipeline** — `src/lib/classification/` (sources, candidates, article). Human-review gates per §20.
4. **Admin tool** — `/admin` (three roles, structural privacy wall, review queue, feedback dashboard, append-only audit log) per §21.
5. **Beyond Your Ballot** — runs against the static `src/data/beyond-ballot-candidates.json` per §23.
6. **Article Bias Checker** — `src/lib/classification/classifyArticle.ts` + the Media Diet right rail per §24b.
7. **Your Ballot — federal** — congress.gov + FEC; address resolution; candidate cards per §22.
8. **Your Ballot — state** — Open States v3; statewide + state legislative per §22.
9. **Your Media Diet** — three-tier recommendations against the 60-source catalog per §24.
10. **Methodology / FAQ / Privacy pages** — per §25/§26/§27.

Note: two sessions have run with Opus 4.8 Max — the recommendation-engine design and this spec-write session. One Opus session remains before launch: the full bias/competitive check (see the Project-chat prompt above).

Working conventions:
- Auto-commit and push after every task that modifies files — keep the repo in sync
- Read AGENTS.md and CLAUDE.md at session start; they contain standing instructions that override defaults
- Flag open questions from SPEC.md rather than resolving them independently — decisions come back to the Claude Project
- Never use Google Civic Representatives endpoint (sunset Apr 2025) or ProPublica Congress API (archived Feb 2025) — feasibility doc has replacements
- Privacy is non-negotiable: Plausible only, exactly two cookies, no third-party tracking

Start by reading SPEC.md and DECISIONS.md, note the current state, then wait for the specific task.

---

## Updating the spec

When spec changes are made in the Claude Project, push to GitHub:

```bash
cd /path/to/bedrock
git add SPEC.md
git commit -m "Spec update: [brief description of what changed]"
git push origin main
```

Token is in .env.local as GITHUB_TOKEN.

---

## Brand & Design Files

Two files are the source of truth for all brand, copy, and design work. Read them at the start of any session involving copy, UI, or design decisions.

**Brand guidelines** (voice, tone, colors, typography, logo, audience, positioning):
```
docs/brand-guidelines.md
https://raw.githubusercontent.com/mattb2518/bedrock/main/docs/brand-guidelines.md
```

**CSS design tokens** (all color values, type scale, spacing, component tokens):
```
src/styles/tokens.css
https://raw.githubusercontent.com/mattb2518/bedrock/main/src/styles/tokens.css
```

**For Claude Project sessions (claude.ai):** Fetch brand-guidelines.md via the raw GitHub URL above before any copy or design work.

**For Claude Code sessions:** Both files are in the repo. Read them from the filesystem. Import tokens.css into your global stylesheet — do not redefine these values elsewhere.

