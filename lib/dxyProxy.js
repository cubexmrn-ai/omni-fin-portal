// lib/dxyProxy.js
//
// PHASE 3 ADDITION — a client-side "DXY" (ICE U.S. Dollar Index) proxy
// for the /market-analysis multi-instrument watchlist strip.
//
// HONESTY NOTE: this project has no DXY data feed (no provider here
// publishes the real index), so rather than fabricate a number, this
// computes the actual publicly-documented ICE formula from the six
// G10 fiat rates already fetched by lib/marketData.js's
// getUnifiedRates() for every other converter/calculator on the site
// — zero new API calls, same Zero-API-Huddle rule as everything else
// in this project. It's a genuine calculation of a real formula using
// real live rates, not an invented figure — but it's still a PROXY:
// ICE's own published index applies small periodic weight revisions
// this project doesn't track, so this will track the real DXY closely
// but not tick-for-tick identically. Every place this is shown says
// "proxy" rather than implying it's the official index value.
//
// Formula (ICE's own published DXY composition, 6 currencies):
//   DXY = 50.14348112
//         × EURUSD^(-0.576)
//         × USDJPY^(0.136)
//         × GBPUSD^(-0.119)
//         × USDCAD^(0.091)
//         × USDSEK^(0.042)
//         × USDCHF^(0.036)

/**
 * Computes the DXY proxy price from a getUnifiedRates() payload.
 * Returns null if any of the six required fiat rates is missing.
 */
export function computeDxyProxy(ratesData) {
  const fiat = ratesData?.fiat;
  if (!fiat) return null;

  const eurUsd = Number.isFinite(fiat.EUR) && fiat.EUR !== 0 ? 1 / fiat.EUR : null; // fiat.EUR = EUR per 1 USD
  const gbpUsd = Number.isFinite(fiat.GBP) && fiat.GBP !== 0 ? 1 / fiat.GBP : null;
  const usdJpy = fiat.JPY;
  const usdCad = fiat.CAD;
  const usdSek = fiat.SEK;
  const usdChf = fiat.CHF;

  const parts = [eurUsd, usdJpy, gbpUsd, usdCad, usdSek, usdChf];
  if (!parts.every((p) => Number.isFinite(p) && p > 0)) return null;

  const dxy =
    50.14348112 *
    Math.pow(eurUsd, -0.576) *
    Math.pow(usdJpy, 0.136) *
    Math.pow(gbpUsd, -0.119) *
    Math.pow(usdCad, 0.091) *
    Math.pow(usdSek, 0.042) *
    Math.pow(usdChf, 0.036);

  return Number.isFinite(dxy) ? dxy : null;
}
