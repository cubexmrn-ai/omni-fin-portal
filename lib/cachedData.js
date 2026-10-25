// lib/cachedData.js
//
// Thin Next.js-aware caching wrapper around the standalone AI/data
// libraries (lib/sentimentEngine.js, lib/newsAggregator.js). Those
// modules are deliberately framework-agnostic — ZERO Next.js imports,
// per their own header comments' "standalone & modular backend
// architecture" requirement — so the Next-specific caching has to live
// here instead, one layer up, rather than inside them.
//
// WHY THIS EXISTS:
// lib/marketData.js's and lib/newsAggregator.js's own RSS/price
// fetches already use `fetch(url, { next: { revalidate } })`, so they
// stay cached in Next's Data Cache no matter how the calling page is
// rendered. The Gemini/Claude AI calls inside
// getSentimentEngineSnapshot() and getAggregatedNews()'s per-headline
// summarization are NOT cacheable that way (they're built from
// in-memory data, not a stable cacheable GET), so with no cache here,
// making their calling pages fully dynamic (app/market-analysis/page.jsx,
// app/ai-news/page.jsx, app/page.jsx — see those pages' own comments
// for why) would mean EVERY page visit re-runs the full AI pipeline
// from scratch: slow for the visitor and a paid-API-quota burn on
// every single pageview.
//
// unstable_cache() gives these functions the exact "refreshes roughly
// every 15 minutes" behavior the old page-level
// `export const revalidate = 900` used to provide — but as a Data
// Cache entry that's populated lazily on first request, not one Next
// tries to fill synchronously during `next build`'s static-generation
// step (which is what was timing out — see the build error this fixes).

import { unstable_cache } from "next/cache";
import { getSentimentEngineSnapshot } from "@/lib/sentimentEngine";
import { getAggregatedNews } from "@/lib/newsAggregator";
import { upsertNewsItems } from "@/lib/newsStore";

// Matches the previous page-level ISR window these pages used
// (`export const revalidate = 900`), so the real-world refresh cadence
// is unchanged — only *when* the first fill happens has moved (first
// request, not build time).
const CACHE_REVALIDATE_SECONDS = 900;

export const getCachedSentimentEngineSnapshot = unstable_cache(
  getSentimentEngineSnapshot,
  ["sentiment-engine-snapshot"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["sentiment-engine"] }
);

// Wraps getAggregatedNews() so that every time this 900-second cache
// cell actually refills (once per ~15-minute window, never per
// request — unstable_cache only re-invokes the wrapped function on a
// cache miss/expiry), that cycle's real headlines also get archived
// into Supabase's `news_items` table (lib/newsStore.js) — this is what
// keeps an already-indexed /ai-news/<slug> permalink valid forever
// instead of 404ing once the headline rotates out of `data.items`.
//
// Awaited, not fire-and-forget: this only runs on a genuine cache
// refill (a handful of times an hour, not per pageview), and awaiting
// it here — inside the same serverless invocation that's already
// doing the much heavier RSS fetch + AI summarization work — is what
// guarantees the write actually completes before the function can be
// frozen, rather than racing a response that's already been sent.
// upsertNewsItems() itself never throws (see its own header comment),
// but it's wrapped in try/catch anyway as a last line of defense: a
// failure in the archive write must never take down the live
// /ai-news page it's piggybacking on.
async function getAggregatedNewsAndArchive() {
  const data = await getAggregatedNews();
  try {
    await upsertNewsItems(data?.items, data?.macroImpact?.items);
  } catch (err) {
    console.error("lib/cachedData.js: news archive upsert failed:", err?.message || err);
  }
  return data;
}

export const getCachedAggregatedNews = unstable_cache(
  getAggregatedNewsAndArchive,
  ["aggregated-news"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["aggregated-news"] }
);
