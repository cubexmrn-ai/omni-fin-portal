// lib/fetchNews.js
//
// Shared helper for calling the internal /api/news-ai endpoint from
// server components. Mirrors lib/fetchRates.js's base-URL resolution
// so both ISR-cached internal APIs are consumed the same way.

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
