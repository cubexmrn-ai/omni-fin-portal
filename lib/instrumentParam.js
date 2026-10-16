"use client";

// lib/instrumentParam.js
//
// PHASE 3 ADDITION — Cross-Tool State Syncing via URL Parameters.
//
// A single shared `?instrument=<code>` URL search param, read/written
// by useInstrumentParam() below, so picking an instrument in one tool
// (the /market-analysis watchlist strip, the AI Technical Analysis
// symbol picker, the Trading Calculator Suite) and then navigating —
// or being linked — to another page carries that same instrument
// across, without any shared client state, context provider, or
// server round trip: it's just the URL, which is also why the
// resulting links are plain, shareable, bookmarkable URLs.
//
// CANONICAL CODE SPACE: the param's value is always one of
// app/calculators/page.jsx's own PAIR_OPTIONS ids (e.g. "XAUUSD",
// "BTCUSD", "EURUSD", "WTIUSD") plus "DXY" — that file's own
// convention, and the one the person actually typed in this feature's
// spec ("?instrument=XAUUSD"). lib/technicalAnalysis.js's
// INSTRUMENT_OPTIONS (AiTechnicalAnalysis, the watchlist strip's own
// scoring) uses a DIFFERENT, shorter code for the same instruments in
// a few cases (e.g. "XAU" not "XAUUSD", "BTC" not "BTCUSD") — the two
// small maps below translate between the two wherever a pair of
// codes genuinely refers to the same instrument. A canonical code with
// no technical-analysis equivalent (e.g. "US500") simply has no entry
// in CANONICAL_TO_TECHNICAL — callers check for that already (see
// AiTechnicalAnalysis.jsx's usage).
//
// app/calculators/page.jsx itself deliberately does NOT import this
// file — that page has a hard zero-project-file-import rule (see its
// own header comment) — so it reads/writes the exact same
// "instrument" param name by literal string with next/navigation's
// hooks directly, the same "duplicate the literal string, don't
// import" pattern it already uses for Base Currency/Language sync.

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const INSTRUMENT_PARAM_NAME = "instrument";

/** Common aliases a person might type or link with, normalized to this
 * project's own canonical codes above. */
const ALIASES = {
  GOLD: "XAUUSD",
  SILVER: "XAGUSD",
  BITCOIN: "BTCUSD",
  ETHEREUM: "ETHUSD",
  OIL: "WTIUSD",
  CRUDE: "WTIUSD",
  XAU: "XAUUSD",
  XAG: "XAGUSD",
  BTC: "BTCUSD",
  ETH: "ETHUSD",
  WTI: "WTIUSD",
};

export const CANONICAL_TO_TECHNICAL = {
  XAUUSD: "XAU",
  XAGUSD: "XAG",
  WTIUSD: "WTI",
  BTCUSD: "BTC",
  ETHUSD: "ETH",
  EURUSD: "EURUSD",
  GBPUSD: "GBPUSD",
  AUDUSD: "AUDUSD",
  USDJPY: "USDJPY",
  // DXY, US500, NAS100, USDCAD, USDCHF, NZDUSD, EURJPY, GBPJPY, USDPKR
  // intentionally have no entry — no lib/technicalAnalysis.js
  // instrument (or, for DXY, a different kind of row entirely; see
  // lib/marketPulse.js's getWatchlistSnapshot()) backs them.
};

export const TECHNICAL_TO_CANONICAL = Object.entries(CANONICAL_TO_TECHNICAL).reduce(
  (acc, [canonical, technical]) => {
    acc[technical] = canonical;
    return acc;
  },
  {}
);

/** Normalizes any raw string (URL param, a typed alias) to this
 * project's canonical code, or null if it isn't recognized at all. */
export function normalizeInstrumentCode(raw) {
  if (!raw) return null;
  const upper = String(raw).trim().toUpperCase();
  return ALIASES[upper] || upper;
}

/**
 * Reads the current `?instrument=` value (normalized + aliased) and
 * returns a setter that updates it in place via router.replace — no
 * full page reload, no new history entry per change, no scroll reset.
 * Pass `null` to the setter to remove the param entirely.
 */
export function useInstrumentParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const code = normalizeInstrumentCode(searchParams.get(INSTRUMENT_PARAM_NAME));

  const setInstrument = useCallback(
    (nextCode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextCode) params.set(INSTRUMENT_PARAM_NAME, nextCode);
      else params.delete(INSTRUMENT_PARAM_NAME);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return [code, setInstrument];
}

/** Builds a plain `/path?instrument=<code>` href string, for a server
 * component or a plain <Link> that doesn't need the live hook above. */
export function instrumentHref(path, code) {
  if (!code) return path;
  return `${path}?${INSTRUMENT_PARAM_NAME}=${encodeURIComponent(code)}`;
}
