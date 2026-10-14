// app/api/sentiment-engine/route.js
//
// Thin GET route for the standalone Macro Sentiment Engine. All the
// actual logic lives in lib/sentimentEngine.js (a plain, framework-free
// module, per the "standalone & modular backend architecture"
// requirement) — this route just calls it directly and returns JSON.
//
// GET /api/sentiment-engine

import { getSentimentEngineSnapshot } from "@/lib/sentimentEngine";

export async function GET() {
  try {
    const snapshot = await getSentimentEngineSnapshot();
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
