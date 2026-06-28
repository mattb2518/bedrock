# Supabase Persistence Plan — civic profile + demographics

*Status: **proposal, for Matt's review.** Nothing here is built yet. Supersedes
the "browser-only for now" posture in `DECISIONS.md` (2026-06-12) once approved.*

## 1. Why this, why now

Today the entire civic profile — quiz answers, the computed result/mantle,
dealbreakers, and the new demographics — lives **only in the browser**
(`localStorage`, via the zustand quiz store). That was a deliberate, dated call:
keep migration cost at zero while the quiz's shape churned. It has churned a lot,
so the call was right.

Two things have changed:

1. **The quiz is converging.** The structure (4 layers + importance closer +
   dealbreakers + demographics) is stable; mostly copy/UX is moving now.
2. **Demographics are "important" calibration data** you don't want trapped on
   one device. Local-only means: per-device (laptop ≠ phone), and clearing
   browser data wipes everything.

The codebase already anticipates the move: `QuizSession.userId` and the
`attachUser` store action are the seam — currently a local-only stub.

### Goals
- Durable, cross-device civic profile for **signed-in** users.
- **No data loss** when an anonymous quiz-taker creates an account.
- Honor existing commitments: one-click permanent deletion, plain-text export,
  demographics treated identically to quiz data (SPEC §12), Plausible-only / no
  third-party tracking.

### Non-goals (for this phase)
- Server-side **scoring** — the result is still computed client-side; we persist
  it, we don't recompute it in Postgres.
- Real-time multi-device sync / collaboration. Last-write-wins is fine.
- Normalizing every answer into relational rows (see schema rationale).

## 2. Keep local-first; add cloud as the durable layer

We do **not** force an account before the quiz. Anonymous local-first stays —
it's good funnel (take the quiz, *then* sign up at the reveal) and good privacy
(nothing leaves the browser until the user opts into an account). Supabase
becomes the **authoritative store for signed-in users**, with `localStorage` as
an offline cache + the anonymous store.

```
anonymous user → localStorage only
      │  (signs up / signs in)
      ▼
merge localStorage → Supabase  →  Supabase authoritative, localStorage = cache
```

## 3. Schema

**Design choice: one row per user, JSONB for the churn-prone parts**, with a few
promoted scalar columns for querying. Rationale: the question/option shapes still
shift; JSONB means a new question never requires a migration. We promote only the
fields we'd actually filter/aggregate on (primary_type, completion, layers).

```sql
-- supabase/migrations/<timestamp>_quiz_profiles.sql

create table public.quiz_profiles (
  user_id            uuid primary key
                       references auth.users (id) on delete cascade,

  -- churn-prone, stored as JSON (mirrors the QuizSession shape)
  answers            jsonb        not null default '[]'::jsonb,  -- [{questionId, optionId, dependsText?}]
  result             jsonb,                                       -- {primaryType, secondaryTypes, profile, completionPercent}
  demographics       jsonb,                                       -- {partyRelationship, currentRegistration, upbringing, lineage, ageRange, geography, region, note}
  dealbreakers       text[]       not null default '{}',
  dealbreaker_other  text,
  top_dimensions     text[]       not null default '{}',

  -- promoted scalars for querying / cheap reads
  primary_type       text,
  completion_percent int          not null default 0,
  completed_layers   int[]        not null default '{}',

  started_at         timestamptz,
  updated_at         timestamptz  not null default now(),
  created_at         timestamptz  not null default now()
);

-- keep updated_at honest
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger quiz_profiles_touch
  before update on public.quiz_profiles
  for each row execute function public.touch_updated_at();
```

### Row-level security — users see only their own row

```sql
alter table public.quiz_profiles enable row level security;

create policy "own profile - select" on public.quiz_profiles
  for select using (auth.uid() = user_id);
create policy "own profile - insert" on public.quiz_profiles
  for insert with check (auth.uid() = user_id);
create policy "own profile - update" on public.quiz_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own profile - delete" on public.quiz_profiles
  for delete using (auth.uid() = user_id);
```

### Deletion & export — already mostly covered
- **Deletion:** `on delete cascade` against `auth.users` means the existing
  account-delete route (`src/app/api/account/delete/route.ts`, which calls
  `admin.deleteUser`) wipes the profile automatically. No new code required —
  just verify after building.
- **Demographics opt-out (SPEC §12):** set `demographics = null` (a single
  update); it's a column, so it deletes independently of the rest.
- **Export:** a small serializer turns the row into the plain-text profile we
  already promise.

> **Single-table vs. split `demographics` table:** I recommend the single row
> above (simplest; cascade + column-null already satisfy deletion and opt-out).
> If you'd rather demographics be physically separate (e.g. different retention
> later), it's a clean lift to its own `user_demographics` table with the same
> RLS — flagged as an open question below.

## 4. Sync logic (new `src/lib/quiz/sync.ts`)

Three functions, all client-side using the existing anon Supabase client (RLS
enforces ownership):

- `loadProfile()` → fetch the signed-in user's row, hydrate the store.
- `saveProfile(session)` → upsert the row (whole-row upsert keyed on `user_id`).
  **Debounced ~1.5s** and also flushed at milestones (layer complete, reveal,
  dealbreakers, demographics) so we're not chatty per keystroke.
- `mergeLocalIntoCloud()` → on sign-in, if `localStorage` has a session and it's
  **more complete/newer** than the cloud row (compare `completion_percent`, then
  `updated_at`), upsert local → cloud; otherwise hydrate from cloud. Then mark
  the store as cloud-backed.

`attachUser` graduates from "set a local field" to "call `mergeLocalIntoCloud`."

### Where it hooks in
- **Auth callback** (`src/app/auth/callback/route.ts`) / first authed load →
  `mergeLocalIntoCloud()` then `loadProfile()`.
- **Quiz store** → a subscription that calls debounced `saveProfile()` on change
  **when a user is signed in** (anonymous users keep writing only to
  `localStorage`).

## 5. Conflict resolution

Last-write-wins per row, with a tie-breaker that prefers **the more complete
profile**: compare `completion_percent` first, then `updated_at`. This protects
the common case — someone did Layers 1–3 anonymously on a laptop, then signs in
on a fresh phone — from a near-empty phone session clobbering real progress.

## 6. Rollout (phased, each shippable on its own)

1. **Migration only** — table + RLS + trigger. Inert; nothing reads/writes yet.
2. **Write path** — `saveProfile()` on milestones for signed-in users. Local
   store still authoritative; cloud is a shadow copy. Verify rows land with
   correct RLS.
3. **Read + merge** — `loadProfile()` on authed load and `mergeLocalIntoCloud()`
   on sign-in. Cloud becomes authoritative for signed-in users.
4. **Verify commitments** — delete cascade wipes the row; export reads it;
   demographics opt-out nulls it.
5. (Later) Wire the deferred **"Edit responses"** retake flow to write through
   the same path.

## 7. Open questions for Matt

1. **Single `quiz_profiles` row (recommended) vs. a separate `user_demographics`
   table?** Single keeps it simple; split only if you foresee different handling
   for demographics specifically.
2. **Conflict rule:** is "most complete, then newest wins" the right call, or do
   you want an explicit "this device has newer answers — keep which?" prompt on
   conflict? (I lean automatic; prompting adds friction for a rare case.)
3. **Write cadence:** milestone + debounced (recommended) vs. only on explicit
   "Save" actions. Milestone is more durable; explicit is fewer writes.
4. **Anonymous retention:** keep local-first before sign-up (recommended), or
   require an account before the quiz starts? The former is better funnel; the
   latter guarantees nothing is ever device-only.

## 8. Rough effort

Small-to-medium backend task: ~1 migration, ~1 sync module (~150 lines), 2–3
hookpoints, and verification of delete/export. Phases 1–3 are the bulk; 4 is
checking existing routes still hold.
