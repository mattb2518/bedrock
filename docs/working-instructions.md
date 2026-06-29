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

### Open questions (SPEC.md Section 16)
Unresolved design decisions live in Section 16. Claude Code must flag these and not resolve them independently. Decisions come back to the Claude Project.

---

### Two sessions flagged for more powerful model
1. **Recommendation engine logic** — use Opus 4.7 or Deep Thinking mode
2. **Full bias and competitive landscape check** — run complete quiz through Opus

---

## Starting a new Claude Project chat

Paste this prompt:

---

I'm continuing work on **Bedrock** — a civic identity platform for independent-minded voters at bedrock.guide and bedrock.vote.

Before we start, read these three documents from GitHub:
- **SPEC.md** — master product spec (quiz, type system, brand, all three pillars)
- **DECISIONS.md** — log of all decided questions and deferred items
- **docs/data-sources-feasibility-june2026.md** — authoritative, web-verified reference for all external data sources; governs all data-integration work

Where we are (June 2026):
- Quiz: complete and live
- Brand and visual identity: locked
- Pillar 1 — Conversations: **complete**, declared ready for user testing. All three modes shipped (Openers, Responses, Back-and-forth live chat). See SPEC.md §18.6b for the shipped architecture and DECISIONS.md for all resolved questions.
- Pillar 2 — Ballot: not started
- Pillar 3 — Media Diet: not started
- Pillar 4 — Beyond Your Ballot: not started
- Recommendation engine: not built — design must precede build

What's next (in order):
1. **Engine design** — flag for Opus with extended thinking. Read feasibility doc §6 and §9–10 before this session. The matching formula, scoring model, and schema are the main open questions.
2. **Pillar designs** (Ballot, Media, Beyond Your Ballot) — run these in parallel with or right after engine design so pillar requirements inform the engine before it's built. Open design questions for each pillar are in DECISIONS.md.

Working conventions:
- After completing each section, push spec updates to GitHub
- Run a bias check before showing any new question drafts
- Flag complexity creep — known tendency toward over-engineering
- Engine design session: use Opus with extended thinking
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
- **AI:** Anthropic Claude API (`claude-sonnet-4-6` for Conversations; engine TBD)
- **Analytics:** Plausible only — no Google Analytics, no exceptions
- **DNS:** Cloudflare (bedrock.guide and bedrock.vote)
- **Repo:** github.com/mattb2518/bedrock

Where we are (June 2026):
- Quiz: complete and live
- Brand and visual identity: locked
- Pillar 1 — Conversations: **complete**, ready for user testing. Three modes: Openers, Responses, Back-and-forth (live chat with per-turn coaching, print transcripts, session management). See SPEC.md §18.6b.
- Recommendation engine: not built — must be designed in Claude Project before building
- Pillars 2–4 (Ballot, Media, Beyond Your Ballot): not started — design precedes build

Build sequence going forward:
1. Engine design in Claude Project (use Opus with extended thinking)
2. Pillar designs in Claude Project (parallel with engine design)
3. Build engine in Claude Code once design is settled
4. Build remaining pillars against the live engine

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

