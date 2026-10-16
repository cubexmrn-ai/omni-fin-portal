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

## Scope notes (what this does *not* cover)

- **Votes/Bullseye taps** on community posts stay per-browser (not synced to
  an account) — see `hooks/useCommunityPosts.js`'s header comment for why.
- **Comment editing/deletion** isn't implemented — comments can be posted
  and read, not edited or removed, in this pass.
- **No migration for existing guest Community posts** — only the Trading
  Journal auto-uploads a guest's local entries the first time they sign in;
  a guest's old local-only community posts stay local (cloud posts start
  fresh from the first post made while signed in).
