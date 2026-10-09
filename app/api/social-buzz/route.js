// app/api/social-buzz/route.js
//
// Thin HTTP wrapper around lib/socialBuzz.js's getSocialBuzz() for the
// AI News page's Social Buzz Tracker. Same "call the plain function
// directly from the server component, use this route only for
// external/client-side callers" architecture as app/api/news-ai/route.js
// and app/api/market-ai/route.js — getSocialBuzz() itself is pure,
// synchronous math with no I/O, so there's no self-fetch risk here, but
// the pattern is kept consistent across the project.
//
// See the big header comment in lib/socialBuzz.js for why every number
// this returns is explicitly simulated, not live social data.

import { getSocialBuzz } from "@/lib/socialBuzz";

export async function GET() {
  try {
    const body = getSocialBuzz();
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
