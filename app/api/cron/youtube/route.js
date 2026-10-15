// app/api/cron/youtube/route.js
//
// Dedicated endpoint for Vercel's scheduled Cron Jobs (see vercel.json's
// `crons` entry at the project root) — this is the "autopilot" trigger
// for the YouTube ingestion pipeline. It is NOT the same route as
// app/api/youtube-automation/route.js, which is a plain read-only HTTP
// wrapper around getYoutubeAutomationFeed() for any external/client
// caller; this route exists specifically to be hit on a schedule and to
// force the already-rendered /market-analysis and /ai-news pages to
// regenerate with fresh videos/articles in between their normal ISR
// windows (see those pages' `export const revalidate` — this route's
// revalidatePath() calls are what make a 3-6 hour cron actually useful
// rather than redundant).
//
// WHAT THIS DOES, IN ORDER:
//   1. Optional auth check — if CRON_SECRET is configured as an env
//      var on Vercel, Vercel automatically sends it as
//      `Authorization: Bearer <CRON_SECRET>` on every cron-triggered
//      request (https://vercel.com/docs/cron-jobs). We verify it here
//      so a random visitor hitting this URL by hand can't repeatedly
//      trigger paid YouTube Data API / Gemini API calls. If
//      CRON_SECRET is NOT configured, this check is skipped (so the
//      endpoint still works out of the box) — but it's strongly
//      recommended to set CRON_SECRET in Vercel's env vars for this
//      project, precisely because this route spends API quota/cost on
//      every call.
//   2. Calls getYoutubeAutomationFeed() directly (same function the
//      pages call during SSR) — this both exercises/validates the
//      YOUTUBE_API_KEY + GEMINI_API_KEY-driven pipeline end-to-end and
//      warms Next.js's fetch cache for those same requests.
//   3. Calls revalidateTag("youtube-automation") so the cached result
//      behind lib/cachedData.js's getCachedYoutubeAutomationFeed() —
//      what /market-analysis, /ai-news and app/api/youtube-automation/
//      route.js all actually read from, since those became
//      `force-dynamic` pages/routes rather than page-level ISR (see
//      app/market-analysis/page.jsx's comment for why) — is thrown
//      away, so the next visitor gets this run's fresh videos/articles
//      instead of waiting out the cache's own ~15-minute window.
//      revalidatePath() for /market-analysis and /ai-news is also kept
//      below as a harmless no-op safety net in case either page is
//      ever reverted to page-level ISR.
//
// DELIBERATELY NOT using lib/cachedData.js's cached wrapper for its own
// getYoutubeAutomationFeed() call below — this route's whole purpose is
// to force a REAL fresh ingestion run on a schedule, which is exactly
// what the cached wrapper exists to avoid everywhere else.
//
// HONESTY NOTE: there is no database/KV layer in this project (see
// lib/youtubeAutomation.js's own header comment) — "articles" are not
// persisted rows, they're generated on demand by
// getYoutubeAutomationFeed() and served through Next.js's page-level
// ISR cache (`revalidate`). This route's job is to force that cache to
// refresh on a schedule; it does not write to any separate article
// store, because none exists.

import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getYoutubeAutomationFeed } from "@/lib/youtubeAutomation";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isAuthorized(request) {
  const expected = process.env.CRON_SECRET;
  // No CRON_SECRET configured on Vercel yet — allow the call through
  // rather than locking the user out of their own just-wired-up
  // automation. Strongly recommended to set one (see file header).
  if (!expected) return true;

  const authHeader = request.headers.get("authorization") || "";
  return authHeader === `Bearer ${expected}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();

  try {
    const feed = await getYoutubeAutomationFeed();

    // Invalidate the Data Cache entry /market-analysis, /ai-news and
    // app/api/youtube-automation/route.js actually read from (see the
    // file header above) so the next visitor gets THIS run's fresh
    // videos/articles instead of waiting out the cache's own window.
    revalidateTag("youtube-automation");
    // Harmless no-op safety net for either page's HTML-level cache —
    // both are `force-dynamic` now, so there's nothing for this to
    // invalidate in practice, but it costs nothing to keep.
    revalidatePath("/market-analysis");
    revalidatePath("/ai-news");

    return NextResponse.json(
      {
        ok: true,
        startedAt,
        completedAt: new Date().toISOString(),
        postCount: feed.posts.length,
        usingLiveYoutubeApi: feed.usingLiveYoutubeApi,
        usingAiExtraction: feed.usingAiExtraction,
        usingGeminiExtraction: feed.usingGeminiExtraction,
        usingClaudeExtraction: feed.usingClaudeExtraction,
        transcriptCount: feed.transcriptCount,
        note: feed.note,
        // Exact per-model Gemini failure reasons from this run (HTTP
        // status + Gemini's own error body / exception message) — see
        // lib/youtubeAutomation.js's recordGeminiError(). Empty array
        // when Gemini wasn't attempted or every call succeeded.
        geminiErrors: feed.geminiErrors || [],
        revalidatedPaths: ["/market-analysis", "/ai-news"],
      },
      { status: 200 }
    );
  } catch (err) {
    // getYoutubeAutomationFeed() is designed to never throw, but this
    // guarantees the cron run is logged as a clean JSON failure in
    // Vercel's cron/function logs rather than an unhandled 500.
    return NextResponse.json(
      {
        ok: false,
        startedAt,
        completedAt: new Date().toISOString(),
        error: err?.message || "Unknown error running the YouTube cron ingestion",
      },
      { status: 200 }
    );
  }
}
