// app/api/rate-history/route.js
//
// Serves the Universal Currency Converter's real 24h-trend badge
// (components/CurrencyConverter.jsx) — see lib/rateHistory.js's header
// for the provider chain (Frankfurter for fiat, CoinGecko for crypto,
// metals disclosed as unavailable). The client already holds today's
// live pairRate from /api/rates, so this route only needs to resolve
// *yesterday's* rate for the same pair and let the client compute the
// delta — no duplicate "today" fetch here.
//
// GET /api/rate-history?fromClass=fiat&fromCode=USD&toClass=fiat&toCode=PKR

import { getHistoricalUsdValue, yesterdayIsoDate } from "@/lib/rateHistory";
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

  const isoDate = yesterdayIsoDate();

  try {
    const [fromUsd, toUsd] = await Promise.all([
      getHistoricalUsdValue(fromClass, fromCode, isoDate, metaFor(fromClass, fromCode)),
      getHistoricalUsdValue(toClass, toCode, isoDate, metaFor(toClass, toCode)),
    ]);

    // Either leg missing (metals, or a provider outage) — disclosed as
    // unavailable rather than guessed. This is the expected, common
    // path for any pair involving a metal, not just an error case.
    if (!Number.isFinite(fromUsd) || !Number.isFinite(toUsd) || toUsd === 0) {
      return Response.json({ available: false, asOfDate: isoDate, reason: "no-historical-rate" });
    }

    return Response.json({
      available: true,
      asOfDate: isoDate,
      pairRate: fromUsd / toUsd, // 1 `from` = this many `to`, as of yesterday
    });
  } catch {
    // Defensive — getHistoricalUsdValue() already swallows its own
    // fetch errors, but a route never lets an unexpected throw surface
    // a raw error to the client either.
    return Response.json({ available: false, asOfDate: isoDate, reason: "lookup-failed" });
  }
}
