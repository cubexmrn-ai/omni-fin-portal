# Supabase setup — Trading Journal & Community Forum cloud sync

This project's Trading Journal (`hooks/useTradingJournal.js`) and Community
Forum (`hooks/useCommunityPosts.js`) work fully offline/localStorage-only
with zero setup. The steps below are **optional** — they turn on real
cross-device sync and accounts, backed by Supabase's free tier (50k monthly
active users, 500MB database). Skip this file entirely if you don't need
that yet; nothing else in the app depends on it.

## 1. Create a free Supabase project

1. Sign up at [supabase.com](https://supabase.com) (free tier, no credit
   card).
2. Create a new project. Note its **Project URL** and **anon public key**
   (Project Settings → API) — these go into `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` (and in Vercel's
   Environment Variables for production).
3. Enable email/password auth: Authentication → Providers → Email should
   already be on by default. (This app doesn't use any other provider.)

## 2. Create the tables

Run this in the Supabase SQL Editor (Project → SQL Editor → New query):

```sql
-- Trading Journal — one row per entry, owned by exactly one user.
create table trading_journal (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  created_at timestamptz not null default now(),
  fields jsonb not null default '{}'::jsonb
);

create index trading_journal_user_id_idx on trading_journal(user_id);

-- Community Forum — posts are PUBLIC-READABLE, write requires sign-in.
create table community_posts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_handle text not null,
  category text not null,
  asset_tags jsonb not null default '[]'::jsonb,
  title text not null,
  body text not null,
  bias text,
  entry numeric,
  stop_loss numeric,
  take_profit numeric,
  created_at timestamptz not null default now()
);

create index community_posts_created_at_idx on community_posts(created_at desc);

-- Comments on a community post — also public-readable, write requires sign-in.
create table community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_handle text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index community_comments_post_id_idx on community_comments(post_id);
```

## 3. Row Level Security (required)

Supabase tables default to RLS **on** with no policies, which blocks all
access — you must add these policies for the app to actually read/write.
Run this too:

```sql
alter table trading_journal enable row level security;
alter table community_posts enable row level security;
alter table community_comments enable row level security;

-- Trading Journal: fully private — a user can only see/change their own rows.
create policy "journal_select_own" on trading_journal
  for select using (auth.uid() = user_id);
create policy "journal_insert_own" on trading_journal
  for insert with check (auth.uid() = user_id);
create policy "journal_update_own" on trading_journal
  for update using (auth.uid() = user_id);
create policy "journal_delete_own" on trading_journal
  for delete using (auth.uid() = user_id);

-- Community posts: anyone can read (including signed-out visitors via the
-- anon key); only a signed-in user can insert, and only as themselves.
create policy "community_posts_select_all" on community_posts
  for select using (true);
create policy "community_posts_insert_own" on community_posts
  for insert with check (auth.uid() = user_id);

-- Comments: same public-read / own-write-only shape as posts.
create policy "community_comments_select_all" on community_comments
  for select using (true);
create policy "community_comments_insert_own" on community_comments
  for insert with check (auth.uid() = user_id);
```

## 4. Set the environment variables

Add to `.env.local` (and to Vercel's Environment Variables for your deployed
site):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

That's it — `lib/supabase.js` picks these up automatically. With them unset
(or if either table/policy above is missing and a query fails), both
features fall back to their original localStorage-only behavior rather than
breaking the page — see `lib/supabase.js`'s header comment.

## 5. (Optional) AI News archive — persistent permalinks + Load More

This turns on two things on `/ai-news`:
- **Permalinks that never 404.** Without this table, an individual story's
  URL (`/ai-news/<slug>`) is only valid while that headline is still inside
  the live 15-minute RSS window (`lib/newsAggregator.js`) — once it rotates
  out, the URL 404s, which is bad for any search engine that already
  indexed it. With this table, every headline OmniFin Portal has ever shown
  gets a permanent row, so its permalink stays valid indefinitely.
- **"Load More" archive browsing** on `/ai-news`'s news wire, past whatever
  the current live batch happens to be, plus a "pin the most recent
  high-impact summaries" fallback for the AI High-Impact News hero on a
  quiet news day instead of an empty section.

Skip this section entirely if you don't want that yet — same as every
other table here, nothing else depends on it. Without it, `/ai-news` keeps
working exactly as it does today (live items only, no archive, no Load
More past the current batch).

Run this in the Supabase SQL Editor:

```sql
-- AI News archive — one row per headline OmniFin Portal has ever shown,
-- keyed by the same deterministic slug lib/newsSlug.js already computes
-- (source+title+link), so a permalink that's already live and indexed
-- never changes URL once this table exists. No user_id — these rows come
-- from the server-side RSS aggregator, never from a visitor, so writes
-- go through the service-role key (below) and bypass RLS entirely rather
-- than needing an "owns this row" policy the way trading_journal does.
create table news_items (
  slug text primary key,
  title text not null,
  link text,
  source text not null,
  category text,
  published_at timestamptz,
  excerpt text,
  sentiment text,
  related_assets jsonb not null default '[]'::jsonb,
  summary text,
  summary_status text,
  summary_provider text,
  macro_impact jsonb, -- null unless this headline got a directional favorable/unfavorable/note read
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index news_items_published_at_idx on news_items(published_at desc);
create index news_items_macro_impact_idx on news_items(published_at desc)
  where macro_impact is not null;
```

RLS: public-readable (anyone can read a permalink or browse the archive,
including signed-out visitors via the anon key), but **no insert/update
policy for the anon role at all** — every write happens server-side via
`SUPABASE_SERVICE_ROLE_KEY` below, which bypasses RLS by design, so
there's no path for a client-side key to forge a news item the way there
would be if this followed `community_posts`'s "insert as yourself" shape.

```sql
alter table news_items enable row level security;

create policy "news_items_select_all" on news_items
  for select using (true);
```

Then add **one more** environment variable (Project Settings → API → the
**service_role** key, NOT the anon key — this one is secret, grants full
read/write bypassing RLS, and must never be prefixed `NEXT_PUBLIC_` or it
would ship to every visitor's browser):

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

`lib/newsStore.js` picks this up automatically, server-side only — it's
never imported by a `"use client"` file, the same boundary
`lib/supabase.js`'s own header comment draws for the opposite reason
(that one is deliberately browser-only; this one is deliberately
server-only). With it unset, every archive feature no-ops and `/ai-news`
behaves exactly as it does today — nothing breaks, nothing changes.

## 6. (Optional) Friction-free guest Community posting

Only needed if you already ran section 2/3's Community tables above —
this is a small follow-up migration, not a new table. It removes the
"sign in to post" requirement entirely: a guest's post or comment now
reaches the real, publicly-readable `community_posts`/`community_comments`
tables with just a display handle, no email/password/confirmation step.
Signing in stays available as an optional upgrade (ties your posts to an
account across devices) — it's just no longer required to be seen by
anyone else. See `lib/communityStore.js`'s header comment for the full
design (why this goes through a server route with the service-role key
rather than a looser RLS policy).

Run this in the Supabase SQL Editor — it only relaxes a NOT NULL
constraint, so it's safe to run even with existing rows:

```sql
-- A guest-authored row has no real auth.users row to point at, so
-- user_id has to be allowed to stay null for both tables. The existing
-- RLS insert policies ("auth.uid() = user_id") are UNCHANGED and still
-- apply to the anon-key client exactly as before — a guest post never
-- goes through that path at all; it's written server-side with the
-- service-role key (which bypasses RLS by design), so there's no new
-- anon-writable surface here, just a column that can now be null.
alter table community_posts alter column user_id drop not null;
alter table community_comments alter column user_id drop not null;
```

Skip this section if you'd rather keep posting gated behind sign-in —
without it, `hooks/useCommunityPosts.js`'s guest path will get an insert
error from Supabase (NOT NULL violation) and fall back to this guest's
original browser-local-only behavior, so nothing breaks either way.

## Scope notes (what this does *not* cover)

- **Votes/Bullseye taps** on community posts stay per-browser (not synced to
  an account) — see `hooks/useCommunityPosts.js`'s header comment for why.
- **Comment editing/deletion** isn't implemented — comments can be posted
  and read, not edited or removed, in this pass.
- **No migration for existing guest Community posts** — only the Trading
  Journal auto-uploads a guest's local entries the first time they sign in;
  a guest's old local-only community posts stay local (cloud posts start
  fresh from the first post made while signed in).
