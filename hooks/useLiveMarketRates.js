"use client";

// hooks/useLiveMarketRates.js
//
// Shared client-side live-rates hook for the new Household Utility
// Suite (components/tools/*) — Gold & Jewellery Making-Charges and
// Zakat both need the SAME live XAU/USD, XAG/USD and fiat FX rates the
// Metals & Commodities Calculator already fetches (components/
// GoldCalculator.jsx), so this factors that fetch pattern out once
// rather than copy-pasting it a third and fourth time. Hits the
// project's own existing /api/rates endpoint (lib/fetchRates.js) —
// ZERO new data source, per the Zero-API-Huddle rule.
//
// Auto-refreshes hourly client-side, matching the server's own 1-hour
// ISR cache (see app/api/rates/route.js), and always resolves to a
// usable (if stale) fallback rather than ever leaving a calculator
// blank on a failed fetch.

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRates } from "@/lib/fetchRates";
import { FALLBACK_RATES as FIAT_FALLBACK_RATES } from "@/lib/currencies";
import { METAL_FALLBACK_USD } from "@/lib/metals";

export function useLiveMarketRates() {
  const [fiatRates, setFiatRates] = useState(FIAT_FALLBACK_RATES);
  const [metalRates, setMetalRates] = useState(METAL_FALLBACK_USD);
  const [status, setStatus] = useState("loading"); // loading | live | fallback | error
  const [fetchedAt, setFetchedAt] = useState(null);
  const loadedOnceRef = useRef(false);

  const load = useCallback(async () => {
    setStatus((prev) => (prev === "live" ? "live" : "loading"));
    try {
      const data = await fetchRates({ noStore: true });
      if (!data || !data.fiat) throw new Error("Malformed rates payload");

      setFiatRates({ ...FIAT_FALLBACK_RATES, ...data.fiat });
      setMetalRates({ ...METAL_FALLBACK_USD, ...(data.metals || {}) });
      setFetchedAt(data.fetchedAt || new Date().toISOString());
      setStatus(data.warnings?.length ? "fallback" : "live");
    } catch {
      setFiatRates(FIAT_FALLBACK_RATES);
      setMetalRates(METAL_FALLBACK_USD);
      setFetchedAt(new Date().toISOString());
      setStatus("error");
    } finally {
      loadedOnceRef.current = true;
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { fiatRates, metalRates, status, fetchedAt };
}
