// lib/fetchRates.js
//
// Shared helper for calling the internal /api/rates endpoint from both
// server components (relative fetch needs an absolute base URL) and
// client components. Keeps the ISR revalidate window in one place.

export const RATES_REVALIDATE_SECONDS = 900; // 15 minutes

/**
 * Resolves an absolute base URL for server-side fetches.
 * Falls back through common Vercel/Next env vars, then localhost.
 */
function resolveBaseUrl() {
  if (typeof window !== "undefined") return ""; // client: relative fetch is fine
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Fetches the latest USD-base exchange rates from the internal API route.
 * Safe to call from both server components (layouts/pages) and client
 * components (inside useEffect).
 *
 * @param {{ noStore?: boolean }} [options]
 * @returns {Promise<{ base: string, rates: Record<string, number>, source: string, fetchedAt: string }>}
 */
export async function fetchRates(options = {}) {
  const base = resolveBaseUrl();
  const url = `${base}/api/rates`;

  const fetchOptions = options.noStore
    ? { cache: "no-store" }
    : { next: { revalidate: RATES_REVALIDATE_SECONDS } };

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    throw new Error(`fetchRates failed with status ${res.status}`);
  }

  return res.json();
}
