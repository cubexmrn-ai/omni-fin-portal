// app/api/sentiment-engine/route.js
//
// Thin GET route for the standalone Macro Sentiment Engine. All the
// actual logic lives in lib/sentimentEngine.js (a plain, framework-free
// module, per the "standalone & modular backend architecture"
// requirement) — this route just calls it directly and returns JSON.
//
// GET /api/sentiment-engine
//
// `force-dynamic` stops Next.js from attempting to statically
// prerender this route at build time, which is what started timing
// out ("Static page generation for /api/sentiment-engine is still
// timing out after 3 attempts") once a real paid GEMINI_API_KEY made
// getSentimentEngineSnapshot() actually run its full sequential
// per-asset AI calls instead of short-circuiting to an instant
// fallback. Calling the cached wrapper (lib/cachedData.js) rather than
// the raw function means a direct hit on this route still shares the
// same ~15-minute cached result the pages use, instead of re-running
// the whole AI pipeline on every single request. `maxDuration` gives a
// cold (cache-miss) request more time than the platform default to
// finish that first real run.

import { getCachedSentimentEngineSnapshot } from "@/lib/cachedData";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  try {
    const snapshot = await getCachedSentimentEngineSnapshot();
    return Response.json(snapshot, { status: 200 });
  } catch (err) {
    // Last-resort guarantee this route always returns valid JSON, never
    // Next.js's default HTML error page — same pattern as
    // app/api/rates/route.js, app/api/news-ai/route.js and
    // app/api/market-ai/route.js.
    return Response.json(
      { error: `sentiment-engine route failed unexpectedly: ${err.message || "unknown error"}` },
      { status: 200 }
    );
  }
}
