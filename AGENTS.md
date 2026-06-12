<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

At the start of every new session, run git pull to make sure you're working from the latest code. Tell me if there were any updates pulled.

After completing any task that modifies files, commit the changes with a clear, descriptive message and push to main. Don't ask for permission — just do it as part of finishing the task. The goal is keeping the repo in sync across multiple working copies, so don't wait for an explicit cue.

# Data sources are in flux — check the feasibility doc first

Before any work that touches external data integration, candidate/race/media schemas, or the scoring/recommendation engine, read `docs/data-sources-feasibility-june2026.md` — the authoritative, web-verified reference for which sources are live, their cost/licensing/coverage, schema starter fields, and the build sequence. It supersedes `SPEC.md`'s data-source notes where they conflict. (Two once-standard APIs are dead: Google Civic's Representatives endpoint and the ProPublica Congress API — the doc names replacements.) Product/strategy decisions and their status live in `DECISIONS.md`.

# Committing instruction files

Exception to the auto-commit rule above: after a substantial block of edits to `CLAUDE.md` or `AGENTS.md`, stop and prompt the user to commit, including a ready-to-use commit message. Do not commit these files without the user's explicit go-ahead.
