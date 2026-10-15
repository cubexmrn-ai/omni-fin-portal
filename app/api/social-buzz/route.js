// app/api/social-buzz/route.js
//
// Thin HTTP wrapper around lib/socialBuzz.js's getSocialBuzz() for the
// AI News page's Social Buzz Tracker. Same "call the plain function
// directly from the server component, use this route only for
// external/client-side callers" architecture as app/api/news-ai/route.js
// and app/api/market-ai/route.js.
//
// getSocialBuzz() is now async: when REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET
// are configured it makes real network calls to Reddit's API per asset,
// falling back to the original deterministic simulation per-asset on
// any failure (see the header comment in lib/socialBuzz.js).

import { getSocialBuzz } from "@/lib/socialBuzz";

// Required now that getSocialBuzz() can make outbound network calls
// (Reddit) rather than being pure, synchronous math — same reasoning as
// every other live-data route in app/api.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const body = await getSocialBuzz();
    return Response.json(body, {
      status: 200,
      headers: {
        // Short cache — the underlying data only changes once per UTC
        // hour anyway (see currentHourBucket() in lib/socialBuzz.js).
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    return Response.json(
      {
        assets: [],
        usingLiveApi: false,
        generatedAt: new Date().toISOString(),
        note: `social-buzz route failed unexpectedly: ${err.message || "unknown error"}`,
      },
      { status: 200 }
    );
  }
}
