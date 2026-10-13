// app/sitemap.js
//
// Next.js App Router's built-in sitemap convention: a default-exported
// function returning an array of { url, lastModified, changeFrequency,
// priority } entries. Next.js serves this at /sitemap.xml automatically
// — no separate XML templating needed.
//
// Lists every static route plus every statically-generated dynamic
// route (the same sets each route's own generateStaticParams() already
// pre-renders at build time — see the ARCHITECTURAL NOTE below for why
// that's the right source of truth to reuse here):
//   - /converters/[pair]   -> lib/pairSlugs.js's FEATURED_PAIRS
//   - /converters/unit/[slug] -> lib/unitSlugs.js's FEATURED_UNIT_PAIRS
//   - /learn/[level]/[lesson] -> lib/academyData.js's getAllLessonsFlat()
//
// ARCHITECTURAL NOTE: each of those three lists is already each route's
// single source of truth for generateStaticParams() (see the header
// comments in app/converters/[pair]/page.jsx, app/converters/unit/
// [slug]/page.jsx, and app/learn/[level]/[lesson]/page.jsx) — reusing
// the exact same list here guarantees the sitemap can never drift out
// of sync with what's actually pre-rendered. A non-featured pair slug
// (e.g. some other valid "<from>-to-<to>" combination) still resolves
// on-demand at runtime but is intentionally left out of the sitemap,
// the same way it's left out of generateStaticParams().
//
// SITEMAP_BASE_URL is hardcoded to the production domain rather than
// using lib/siteUrl.js's getSiteUrl() — that helper falls back to
// VERCEL_URL (a per-deployment preview domain) whenever
// NEXT_PUBLIC_SITE_URL isn't set, which would leak preview URLs into
// <loc> entries that search engines crawl and index. Every entry in
// this sitemap must resolve to the real, canonical production URL.

import { FEATURED_PAIRS } from "@/lib/pairSlugs";
import { FEATURED_UNIT_PAIRS } from "@/lib/unitSlugs";
import { getAllLessonsFlat } from "@/lib/academyData";

const SITEMAP_BASE_URL = "https://www.omnifinportal.com";

export default function sitemap() {
  const siteUrl = SITEMAP_BASE_URL;
  // A single "build time" timestamp shared by every entry below. This
  // sitemap doesn't track true per-page last-edited dates (none of this
  // project's content has one), so a shared build-time stamp is the
  // honest choice — it tells crawlers "this sitemap was generated now",
  // not "this exact page changed at this exact second".
  const now = new Date();

  const staticRoutes = [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    { path: "/converters", changeFrequency: "daily", priority: 0.9 },
    { path: "/calculators", changeFrequency: "weekly", priority: 0.9 },
    { path: "/market-analysis", changeFrequency: "daily", priority: 0.9 },
    { path: "/market-analysis/ai-news", changeFrequency: "daily", priority: 0.8 },
    { path: "/ai-news", changeFrequency: "daily", priority: 0.8 },
    { path: "/learn", changeFrequency: "weekly", priority: 0.8 },
    { path: "/learn/lab", changeFrequency: "weekly", priority: 0.7 },
    { path: "/community", changeFrequency: "daily", priority: 0.8 },
    { path: "/dashboard", changeFrequency: "weekly", priority: 0.5 },
    { path: "/about", changeFrequency: "monthly", priority: 0.4 },
    { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ].map((entry) => ({
    url: `${siteUrl}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  // /converters/<pair-slug> — fiat/crypto/metals pairs, rates refresh
  // hourly (see lib/marketData.js), so these are the most volatile
  // content on the site after the homepage.
  const converterPairRoutes = FEATURED_PAIRS.map((pair) => ({
    url: `${siteUrl}/converters/${pair.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // /converters/unit/<unit-slug> — pure unit math, nothing time-sensitive.
  const unitConverterRoutes = FEATURED_UNIT_PAIRS.map((pair) => ({
    url: `${siteUrl}/converters/unit/${pair.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // /learn/<level>/<lesson> — every Academy lesson across all 5 levels.
  const lessonRoutes = getAllLessonsFlat().map(({ level, lesson }) => ({
    url: `${siteUrl}/learn/${level.id}/${lesson.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...converterPairRoutes,
    ...unitConverterRoutes,
    ...lessonRoutes,
  ];
}
