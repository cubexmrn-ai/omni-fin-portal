// lib/siteUrl.js
//
// Resolves an absolute site base URL for metadata (canonical/openGraph
// URLs), JSON-LD structured data, app/sitemap.js, and app/robots.js —
// anywhere a relative path isn't valid.
//
// PRODUCTION_SITE_URL is hardcoded and takes priority over every env
// var whenever Vercel reports this build as the production deployment
// (VERCEL_ENV === "production", set automatically by Vercel — not
// something this project configures). This closes a real bug: the
// previous version fell back to VERCEL_URL (a per-deployment preview
// domain, e.g. omni-fin-portal-git-main-xyz.vercel.app) whenever
// NEXT_PUBLIC_SITE_URL wasn't set in the Vercel dashboard, which could
// silently leak a preview hostname into canonical tags, Open Graph
// URLs, JSON-LD, sitemap.xml and robots.txt. Hardcoding the real
// domain for production removes that single point of misconfiguration
// entirely — metadata can no longer drift to the wrong host no matter
// what is or isn't set in Vercel's env settings.
//
// Non-production builds (local dev, Vercel preview deployments) keep
// the original fallback chain: NEXT_PUBLIC_SITE_URL -> VERCEL_URL ->
// localhost — same chain lib/fetchRates.js's internal resolveBaseUrl()
// uses, kept as its own tiny file since it's needed from
// metadata/JSON-LD contexts that don't otherwise import fetchRates.js.

const PRODUCTION_SITE_URL = "https://www.omnifinportal.com";

export function getSiteUrl() {
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_SITE_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
