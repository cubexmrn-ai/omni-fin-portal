// app/api/rates/route.js
//
// Thin HTTP wrapper around lib/marketData.js's getUnifiedRates() — the
// actual Fiat+Crypto+Metals+Commodities fetch/fallback logic lives
// there now (not inline here), so any other server-side caller (e.g.
// app/api/market-ai/route.js's live-price lookups) can call
// getUnifiedRates() directly instead of fetching this route over HTTP.
// See the comment at the top of lib/marketData.js, and
// lib/newsAggregator.js for the identical pattern applied to the news
// feed — a server-side self-fetch of our own API route during SSR/ISR
// is unreliable and was the root cause of a past production bug there.
//
// This route still exists for the client-side Metals & Commodities
// Calculator (lib/fetchRates.js) and any external caller that wants
// this data over plain HTTP.

import { getUnifiedRates, RATES_REVALIDATE_SECONDS } from "@/lib/marketData";

// Explicit for consistency with every other route in app/api now that
// /api/sentiment-engine's build-time static-generation timeout showed
// what an un-declared, no-params GET route risks — this one's own
// getUnifiedRates() fetches are already Next fetch-cached
// (RATES_REVALIDATE_SECONDS), so it was never actually at risk, but
// declaring it removes any doubt rather than relying on that.
export const dynamic = "force-dynamic";

export async function GET() {
  const responseBody = await getUnifiedRates();

  return Response.json(responseBody, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${RATES_REVALIDATE_SECONDS}, stale-while-revalidate=59`,
    },
  });
}
