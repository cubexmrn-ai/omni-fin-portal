// lib/siteUrl.js
//
// Resolves an absolute site base URL for metadata (canonical/openGraph
// URLs) and JSON-LD structured data, where a relative path isn't valid.
// Same fallback chain as lib/fetchRates.js's internal resolveBaseUrl()
// (NEXT_PUBLIC_SITE_URL -> VERCEL_URL -> localhost), kept as its own
// tiny file since it's needed from metadata/JSON-LD contexts that don't
// otherwise import fetchRates.js.

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
