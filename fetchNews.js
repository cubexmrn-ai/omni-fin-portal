// lib/fetchNews.js
//
// HTTP helper for calling the public /api/news-ai endpoint. Mirrors
// lib/fetchRates.js's base-URL resolution.
//
// NOT used by app/ai-news/page.jsx (or any other Server Component) —
// that page calls lib/newsAggregator.js's getAggregatedNews() directly
// instead. A Server Component self-fetching its own API route by
// absolute URL during server-side rendering/static generation is what
// caused the page's "<!DOCTYPE ... is not valid JSON" error in
// production (see the comment at the top of lib/newsAggregator.js for
// the full explanation). Keep using getAggregatedNews() directly from
// any server-rendered page; reach for this helper only from genuine
// client-side code (e.g. a "use client" component fetching with
// `noStore: true` after mount), the same way lib/fetchRates.js is used
// from GoldCalculator.jsx.

export const NEWS_REVALIDATE_SECONDS = 900; // 15 minutes

function resolveBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Fetches aggregated finance news headlines (with AI-summary placeholders
 * until an Anthropic API key is configured) from the internal API route.
 */
export async function fetchNews(options = {}) {
  const base = resolveBaseUrl();
  const url = `${base}/api/news-ai`;

  const fetchOptions = options.noStore
    ? { cache: "no-store" }
    : { next: { revalidate: NEWS_REVALIDATE_SECONDS } };

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    throw new Error(`fetchNews failed with status ${res.status}`);
  }

  return res.json();
}
