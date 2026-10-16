// app/api/fx-volatility/route.js
//
// Serves the Universal Currency Converter's FX Decision Note
// (components/CurrencyConverter.jsx's FxDecisionNote) — the real
// 30-day volatility counterpart to app/api/rate-history/route.js's
// single-day 24h trend. See lib/rateHistory.js's "Phase 2 item 3"
// section for the provider chain (Frankfurter series for fiat,
// CoinGecko market_chart for crypto, metals disclosed as
// unavailable) and why a missing leg makes the WHOLE pair
// unavailable rather than falling back to zero.
//
// GET /api/fx-volatility?fromClass=fiat&fromCode=USD&toClass=fiat&toCode=PKR

import { getPairVolatility } from "@/lib/rateHistory";
import { getCrypto } from "@/lib/crypto";

export const dynamic = "force-dynamic";

function metaFor(assetClass, code) {
  if (assetClass === "crypto") {
    const crypto = getCrypto(code);
    return { coingeckoId: crypto?.coingeckoId };
  }
  return {};
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fromClass = searchParams.get("fromClass");
  const fromCode = searchParams.get("fromCode");
  const toClass = searchParams.get("toClass");
  const toCode = searchParams.get("toCode");

  if (!fromClass || !fromCode || !toClass || !toCode) {
    return Response.json(
      { available: false, reason: "Missing fromClass/fromCode/toClass/toCode." },
      { status: 400 }
    );
  }

  try {
    const result = await getPairVolatility(
      fromClass,
      fromCode,
      toClass,
      toCode,
      metaFor(fromClass, fromCode),
      metaFor(toClass, toCode)
    );

    if (!result) {
      // Either leg has no real historical series (most often a metals
      // leg, or a transient provider outage) — disclosed, never a
      // fabricated or zero-filled figure.
      return Response.json({ available: false, reason: "no-historical-series" });
    }

    return Response.json({ available: true, ...result });
  } catch {
    // Defensive — getPairVolatility() already swallows its own fetch
    // errors, but this route never lets an unexpected throw surface a
    // raw error to the client.
    return Response.json({ available: false, reason: "lookup-failed" });
  }
}
