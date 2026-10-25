// lib/newsStore.js
//
// SERVER-ONLY persistent archive for AI News headlines — Supabase-backed,
// added Oct 2026 to fix two real problems with the previously fully
// ephemeral /ai-news (lib/newsAggregator.js's 15-minute live RSS window,
// lib/cachedData.js's unstable_cache wrapper):
//
//   1. SEO leak: an individual story's permalink (app/ai-news/[slug]/
//      page.jsx) was only ever valid while that headline was still
//      inside the current live batch — once it rotated out, the URL
//      404'd, even if Google had already indexed it.
//   2. UX: a quiet news cycle (or a slow/degraded RSS pull) could leave
//      the AI High-Impact News hero and the news wire thin or empty,
//      with no fallback to anything previously seen.
//
// This file is the ONLY place that writes to or reads from the
// `news_items` table (see SUPABASE_SETUP.md's "AI News archive" section
// for the schema + RLS policy) — never imported by a "use client" file,
// the exact opposite boundary lib/supabase.js's own header comment draws
// (that client is deliberately browser-only, using the public anon key +
// RLS, for user-owned Trading Journal/Community rows). This one uses
// SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely and must never
// reach a browser bundle — there is intentionally no anon-key write path
// to this table at all (see the RLS policy's own comment).
//
// GRACEFUL DEGRADATION, same convention as lib/supabase.js and every
// other provider chain in this project (lib/marketData.js, lib/
// newsAggregator.js itself): when NEXT_PUBLIC_SUPABASE_URL or
// SUPABASE_SERVICE_ROLE_KEY aren't both set — this deployment hasn't run
// the optional SQL yet, or is running locally without them — every
// function here is a silent no-op (upsert does nothing, reads return
// null/empty). Callers already know to fall back to today's live-cache-
// only behavior when that happens, so a deployment that never configures
// this table keeps working exactly as it did before this file existed.

import { createClient } from "@supabase/supabase-js";
import { buildNewsItemSlug } from "@/lib/newsSlug";

const TABLE = "news_items";

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
      // No session/auth persistence needed — this is a server-side,
      // request-scoped service-role client, not a signed-in user's.
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

/** True when this deployment has the optional AI News archive configured. */
export function isNewsStoreConfigured() {
  return getStoreClient() !== null;
}

function rowToItem(row) {
  return {
    slug: row.slug,
    title: row.title,
    link: row.link,
    source: row.source,
    category: row.category,
    publishedAt: row.published_at,
    excerpt: row.excerpt,
    sentiment: row.sentiment,
    relatedAssets: row.related_assets || [],
    summary: row.summary,
    summaryStatus: row.summary_status,
    summaryProvider: row.summary_provider,
  };
}

function rowToMacroImpactItem(row) {
  if (!row.macro_impact) return null;
  return {
    id: row.link || row.title,
    slug: row.slug,
    title: row.title,
    link: row.link,
    source: row.source,
    publishedAt: row.published_at,
    favorable: row.macro_impact.favorable || [],
    unfavorable: row.macro_impact.unfavorable || [],
    note: row.macro_impact.note || null,
    provider: row.macro_impact.provider || null,
  };
}

/**
 * Upserts this cycle's live headlines into the permanent archive — call
 * once per 15-minute aggregator cycle (see lib/cachedData.js), never per
 * request. `items` is lib/newsAggregator.js's `pageItems` (mock/offline
 * fallback items are filtered out here — they're not real headlines and
 * would otherwise pollute the permanent archive with placeholder text
 * forever). `macroImpactItems` is the same cycle's `macroImpact.items`
 * (lib/newsAggregator.js's buildMacroImpactFeed() output), merged onto
 * the matching row by slug so a story's directional read is archived
 * alongside it rather than lost the moment it ages out of the live
 * macro-impact hero.
 *
 * Never throws — a failed write here must never break the page that
 * triggered it, since this project's whole AI News pipeline is built on
 * "a failing dependency degrades, it doesn't crash" (see lib/
 * newsAggregator.js's own header comment). Logs to the server console
 * so a persistent failure is still visible in Vercel's logs, since
 * nothing else would otherwise surface it.
 */
export async function upsertNewsItems(items, macroImpactItems = []) {
  const client = getStoreClient();
  if (!client) return;

  const realItems = (items || []).filter((item) => item?.title && !item.isMock);
  if (realItems.length === 0) return;

  const macroBySlug = new Map();
  for (const m of macroImpactItems || []) {
    macroBySlug.set(buildNewsItemSlug(m), {
      favorable: m.favorable || [],
      unfavorable: m.unfavorable || [],
      note: m.note || null,
      provider: m.provider || null,
    });
  }

  const nowIso = new Date().toISOString();
  const rows = realItems.map((item) => {
    const slug = buildNewsItemSlug(item);
    return {
      slug,
      title: item.title,
      link: item.link || null,
      source: item.source,
      category: item.category || null,
      published_at: item.publishedAt || null,
      excerpt: item.excerpt || null,
      sentiment: item.sentiment || null,
      related_assets: item.relatedAssets || [],
      summary: item.summary || null,
      summary_status: item.summaryStatus || null,
      summary_provider: item.summaryProvider || null,
      macro_impact: macroBySlug.get(slug) || null,
      last_seen_at: nowIso,
      // first_seen_at deliberately omitted: the column's own
      // `default now()` only applies on INSERT, and Supabase/Postgres
      // upsert only ever touches the columns present in the payload —
      // leaving it out here is what keeps a story's original
      // first-seen timestamp stable across every later upsert of the
      // same slug, rather than this overwriting it to "now" every
      // 15 minutes.
    };
  });

  const { error } = await client.from(TABLE).upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("lib/newsStore.js: upsertNewsItems failed:", error.message || error);
  }
}

/**
 * Looks up one archived headline by its permalink slug. Returns null if
 * the store isn't configured, the slug was never seen, or the query
 * fails — callers (app/ai-news/[slug]/page.jsx) fall back to scanning
 * the live 15-minute cache when this returns null, so a transient
 * Supabase outage degrades to "permalinks for currently-live stories
 * still work," never a hard error.
 */
export async function getNewsItemBySlug(slug) {
  const client = getStoreClient();
  if (!client || !slug) return null;

  const { data, error } = await client.from(TABLE).select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;

  return { item: rowToItem(data), macroImpactItem: rowToMacroImpactItem(data) };
}

/**
 * Keyset-paginated archive browse for "Load More" on the news wire —
 * ordered newest-first by `published_at`, cursor is the ISO timestamp
 * of the last item on the previous page (not an offset/page number),
 * which stays correct as new rows are inserted between page loads
 * rather than drifting the way offset pagination would. Returns
 * `{ items: [], nextCursor: null }` (an empty, valid result, never
 * null) when the store isn't configured, so callers can treat "archive
 * unavailable" and "archive is simply exhausted" the same way: no more
 * to load.
 */
export async function getArchivedNews({ before = null, limit = 20 } = {}) {
  const client = getStoreClient();
  if (!client) return { items: [], nextCursor: null };

  let query = client
    .from(TABLE)
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (before) {
    query = query.lt("published_at", before);
  }

  const { data, error } = await query;
  if (error || !data) return { items: [], nextCursor: null };

  const items = data.map(rowToItem);
  const last = data[data.length - 1];
  const nextCursor = data.length === limit && last?.published_at ? last.published_at : null;

  return { items, nextCursor };
}

/**
 * The archive's answer to "no new high-impact news arrived this cycle":
 * the most recent N stories that DO carry a macro directional read,
 * regardless of whether they're still inside the live 15-minute window.
 * Used by app/ai-news/page.jsx to pin recent high-impact summaries
 * instead of MacroImpactHero rendering its "nothing high-impact right
 * now" empty state on a quiet news day. Returns `[]` (never null) when
 * the store isn't configured or genuinely has nothing — same
 * "unavailable and empty look the same to the caller" shape as
 * getArchivedNews() above.
 */
export async function getLatestWithMacroImpact(limit = 4) {
  const client = getStoreClient();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .not("macro_impact", "is", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(rowToMacroImpactItem).filter(Boolean);
}
