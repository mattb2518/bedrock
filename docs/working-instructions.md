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

The master spec lives at https://github.com/mattb2518/bedrock/blob/main/SPEC.md. Please read it before we start. It contains the complete product architecture, all quiz questions across four layers, the ten civic type system, brand guidelines, context module, layer intros/outros, tech stack, environment variables, and build sequence.

Where we are: all quiz content and architecture are complete. Brand and visual identity are locked. The spec is live in GitHub. Claude Code has been briefed on infrastructure.

What's left to spec before the build:
1. Recommendation engine logic — flag for dedicated Opus 4.7 or Deep Thinking session before finalizing
2. Candidate data model — how candidate positions get quantified on the eight dimensions
3. Media diet pillar (Pillar 2) — source database structure, bias/quality tagging, three-tier recommendation logic
4. Page inventory — all pages with copy, updated with Bedrock name

Working conventions:
- After completing each section, push spec updates to GitHub (I'll provide the token when needed)
- Run a bias check before showing any new question drafts
- Flag complexity creep — I have a known tendency toward over-engineering
- Two sessions flagged for a more powerful model: recommendation engine logic, and a full bias/competitive landscape check on the complete quiz

Start by reading the spec, flag anything incomplete or worth revisiting, then we'll tackle the remaining sections in order.

---

## Starting a Claude Code session

Paste this prompt:

---

I'm building **Bedrock** (bedrock.guide / bedrock.vote) — a civic identity platform for independent-minded voters, built for public scale.

Read the spec first: clone https://github.com/mattb2518/bedrock and read SPEC.md thoroughly before advising on anything. It contains the complete product architecture, quiz questions, type system, brand guidelines, tech stack, environment variables (Section 17), build sequence, and open design questions (Section 16).

This is a standalone public-facing application with its own domain and infrastructure. It is not connected to any existing personal tools. Build it for public scale from the start.

My environment: Windows. Check whether WSL2 is configured and help me set it up if not — it will make the Next.js development environment smoother.

Planned tech stack:
- Frontend: Next.js, Tailwind CSS, Framer Motion
- State management: Zustand
- Database: Supabase (dedicated instance for Bedrock)
- AI: Claude API (Sonnet)
- Analytics: Plausible (privacy-first — no Google Analytics, no exceptions)
- Hosting/DNS: Cloudflare (bedrock.guide registered there; bedrock.vote at Network Solutions with Cloudflare SSL)
- Data APIs: Google Civic Information API, OpenStates, VoteSmart, OpenSecrets free tier, Ballotpedia (pending)

Infrastructure questions to answer before writing any code:
1. Hosting — Cloudflare Pages vs. Vercel vs. other, given public scale requirements
2. Database — dedicated Supabase instance, schema design for user profiles and quiz responses
3. Repository structure — repo exists at github.com/mattb2518/bedrock
4. CI/CD pipeline
5. Local development environment on Windows/WSL2

Before doing anything else, ask me for the GitHub personal access token. I'll paste it in chat. Store it in .env.local as GITHUB_TOKEN once the project is scaffolded — do not store it anywhere else or include it in any committed file.

When you scaffold the project:
- Create .env.local at the project root with all variables from SPEC.md Section 17 as placeholders
- Add GITHUB_TOKEN with the value I provide
- .gitignore already excludes .env.local — do not commit it
- I will fill in the remaining actual values

Build sequence from the spec:
Phase 1: Design system + quiz flow with mocked data
Phase 2: Recommendation engine as pure function
Phase 3: Google Civic API integration
Phase 4: Data layer (Ballotpedia/VoteMate)
Phase 5: Claude API integration
Phase 6: Print view

Privacy commitments are non-negotiable: Plausible only for analytics, no Google Analytics, exactly two cookies, no third-party tracking scripts.

Section 16 of the spec lists open design questions — flag them and do not resolve them independently. Raise them explicitly before proceeding with build work that depends on them.

Start by reading SPEC.md, then give me a clear infrastructure recommendation before writing any code.

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

