// lib/communityStore.js
//
// SERVER-ONLY insert path for guest (no-account) Community posts and
// comments — added Oct 2026 to remove the Supabase Auth email-
// confirmation step as a requirement for posting at all. Same server-
// only boundary as lib/newsStore.js (service-role key, bypasses RLS,
// never imported by a "use client" file): hooks/useCommunityPosts.js
// (browser-side, anon key) still owns the signed-in posting path
// unchanged — a signed-in visitor's post is still a real, RLS-
// protected row they own (`auth.uid() = user_id`). This file exists
// ONLY for the opposite case: a guest with no account at all, whose
// post still needs to land in the real, publicly-readable
// `community_posts`/`community_comments` tables rather than being
// silently local-only to their browser.
//
// WHY A SERVER ROUTE AND NOT A LOOSER RLS POLICY: community_posts'
// existing insert policy is `auth.uid() = user_id` — deliberately
// strict, so no anon-key client can ever forge a row claiming to be
// someone else. Loosening that to also allow a null-user_id insert
// from the anon key would mean literally any script calling Supabase
// directly (not just this site) could spam the table. Routing guest
// writes through app/api/community/posts|comments's service-role
// client instead keeps RLS exactly as strict as it already is, and
// puts this project's own server-side validation (length/whitelist
// checks — see those route files) between a visitor and the table,
// the same shape IndexNow/other server-only write paths in this
// project already use.
//
// GRACEFUL DEGRADATION: same convention as lib/newsStore.js and
// lib/supabase.js — every function here is a silent no-op (returns
// null) when NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY aren't
// both set, so a deployment that hasn't configured Supabase at all (or
// hasn't run this feature's SQL yet — see SUPABASE_SETUP.md's
// "Friction-free guest posting" section) keeps working exactly as
// before: guest posts simply stay local-only to that browser, the
// same fallback hooks/useCommunityPosts.js already had.

import { createClient } from "@supabase/supabase-js";

const POSTS_TABLE = "community_posts";
const COMMENTS_TABLE = "community_comments";

let cachedClient; // undefined = not yet attempted; null = unavailable; object = ready.

function getStoreClient() {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedClient = null;
    return null;
  }

  try {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

/** True when this deployment can accept guest (no-account) Community writes. */
export function isCommunityStoreConfigured() {
  return getStoreClient() !== null;
}

function rowToPost(row) {
  return {
    id: row.id,
    authorHandle: row.author_handle,
    category: row.category,
    assetTags: row.asset_tags || [],
    title: row.title,
    body: row.body,
    bias: row.bias,
    entry: row.entry,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    createdAt: row.created_at,
    baseUpvotes: 0,
    baseDownvotes: 0,
    baseBullseyeCount: 0,
    isUserSubmitted: true,
    isCloudPost: true,
    isGuestPost: row.user_id === null,
  };
}

/**
 * Inserts one guest-authored post. `user_id` is left out of the row
 * entirely (NOT set to null explicitly — relies on the column itself
 * being nullable per SUPABASE_SETUP.md's guest-posting SQL; see that
 * file for the migration this depends on). Every field here is
 * expected to already be validated/whitelisted by the caller (app/
 * api/community/posts/route.js) — this function trusts its input,
 * same as lib/newsStore.js trusts its own caller.
 *
 * Returns the created post (same shape hooks/useCommunityPosts.js's
 * existing fromRow() produces) or `null` if the store isn't
 * configured or the insert fails — callers fall back to this guest's
 * local-only post the same way they always have.
 */
export async function insertGuestPost({
  guestHandle,
  category,
  assetTags,
  title,
  body,
  bias,
  entry,
  stopLoss,
  takeProfit,
}) {
  const client = getStoreClient();
  if (!client) return null;

  const row = {
    id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author_handle: guestHandle,
    category,
    asset_tags: assetTags || [],
    title,
    body,
    bias,
    entry,
    stop_loss: stopLoss,
    take_profit: takeProfit,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await client.from(POSTS_TABLE).insert(row).select().maybeSingle();
  if (error) {
    console.error("lib/communityStore.js: insertGuestPost failed:", error.message || error);
    return null;
  }
  return rowToPost(data || row);
}

/**
 * Inserts one guest-authored comment — same `user_id`-omitted shape as
 * insertGuestPost(). Returns `{ id, authorHandle, body, createdAt }`
 * (matching hooks/useCommunityPosts.js's existing comment shape) or
 * `null`.
 */
export async function insertGuestComment({ postId, guestHandle, body }) {
  const client = getStoreClient();
  if (!client) return null;

  const row = {
    post_id: postId,
    author_handle: guestHandle,
    body,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await client.from(COMMENTS_TABLE).insert(row).select().maybeSingle();
  if (error) {
    console.error("lib/communityStore.js: insertGuestComment failed:", error.message || error);
    return null;
  }
  const created = data || row;
  return {
    id: created.id,
    authorHandle: created.author_handle,
    body: created.body,
    createdAt: created.created_at,
  };
}
