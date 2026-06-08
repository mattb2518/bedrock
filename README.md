# Bedrock

A civic identity platform for independent-minded voters.

**Domains:** bedrock.guide (primary) · bedrock.vote (companion)

## What it is

Bedrock helps voters understand what they actually believe — underneath partisan noise — and translates those beliefs into:
1. Personalized ballot recommendations for every race, top to bottom
2. A curated independent media diet matched to their values

One quiz powers both.

## Documentation

- **[SPEC.md](./SPEC.md)** — Master product specification. Single source of truth for all build decisions. Read this before touching anything.
- **[docs/recommendation-engine.md](./docs/recommendation-engine.md)** — Recommendation engine design (TBD)
- **[docs/media-diet.md](./docs/media-diet.md)** — Media diet pillar design (TBD)

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS, Framer Motion
- **State:** Zustand
- **Database:** Supabase
- **AI:** Claude API (Sonnet)
- **Analytics:** Plausible
- **Hosting/DNS:** Cloudflare

## Build Sequence

1. Design system + quiz flow with mocked data
2. Recommendation engine as pure function
3. Google Civic API integration
4. Data layer (Ballotpedia / VoteMate)
5. Claude API integration
6. Print view

## Status

Pre-build. Spec complete through all four quiz layers, type system, brand guidelines, and quiz experience design. Recommendation engine and media diet pillar to be specced before Phase 2.
