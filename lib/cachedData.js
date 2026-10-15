// lib/cachedData.js
//
// Thin Next.js-aware caching wrapper around the standalone AI/data
// libraries (lib/sentimentEngine.js, lib/youtubeAutomation.js,
// lib/newsAggregator.js). Those modules are deliberately
// framework-agnostic — ZERO Next.js imports, per their own header
// comments' "standalone & modular backend architecture" requirement —
// so the Next-specific caching has to live here instead, one layer up,
// rather than inside them.
//
// WHY THIS EXISTS:
// lib/marketData.js's and lib/newsAggregator.js's own RSS/price
// fetches already use `fetch(url, { next: { revalidate } })`, so they
// stay cached in Next's Data Cache no matter how the calling page is
// rendered. The Gemini/Claude AI calls inside
// getSentimentEngineSnapshot(), getYoutubeAutomationFeed(), and
// getAggregatedNews()'s per-headline summarization are NOT cacheable
// that way (they're built from in-memory data, not a stable cacheable
// GET), so with no cache here, making their calling pages fully
// dynamic (app/market-analysis/page.jsx, app/ai-news/page.jsx,
// app/page.jsx — see those pages' own comments for why) would mean
// EVERY page visit re-runs the full AI pipeline from scratch: slow for
// the visitor and a paid-API-quota burn on every single pageview.
//
// unstable_cache() gives these functions the exact "refreshes roughly
// every 15 minutes" behavior the old page-level
// `export const revalidate = 900` used to provide — but as a Data
// Cache entry that's populated lazily on first request, not one Next
// tries to fill synchronously during `next build`'s static-generation
// step (which is what was timing out — see the build error this fixes).

import { unstable_cache } from "next/cache";
import { getSentimentEngineSnapshot } from "@/lib/sentimentEngine";
import { getYoutubeAutomationFeed } from "@/lib/youtubeAutomation";
import { getAggregatedNews } from "@/lib/newsAggregator";

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

// Not used by app/api/cron/youtube/route.js on purpose — that route's
// whole job is to force a REAL fresh ingestion run on a schedule, then
// invalidate this very cache (via revalidateTag("youtube-automation"))
// so the next visitor gets the new result instead of waiting out the
// full 15-minute window. See that route's own comment.
export const getCachedYoutubeAutomationFeed = unstable_cache(
  getYoutubeAutomationFeed,
  ["youtube-automation-feed"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["youtube-automation"] }
);

export const getCachedAggregatedNews = unstable_cache(
  getAggregatedNews,
  ["aggregated-news"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["aggregated-news"] }
);
