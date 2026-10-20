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
// Every entry below must resolve to the real, canonical production
// URL — lib/siteUrl.js's getSiteUrl() now hardcodes
// https://www.omnifinportal.com whenever Vercel reports this as the
// production deployment (VERCEL_ENV === "production"), so this
// sitemap, app/robots.js, and every page's metadata/JSON-LD all share
// one single source of truth for the domain and can no longer drift
// apart — see that file's header comment for why a previous version
// of getSiteUrl() could leak a preview deployment's hostname here.

import { FEATURED_PAIRS, FEATURED_BASE_CURRENCIES } from "@/lib/pairSlugs";
import { FEATURED_UNIT_PAIRS } from "@/lib/unitSlugs";
import { getAllLessonsFlat } from "@/lib/academyData";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { getSiteUrl } from "@/lib/siteUrl";

export default function sitemap() {
  const siteUrl = getSiteUrl();
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
    { path: "/tools", changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools/gold-jewellery-calculator", changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools/loan-emi-tax-calculator", changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools/zakat-calculator", changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools/savings-inflation-calculator", changeFrequency: "weekly", priority: 0.8 },
    // Utility Tools Suite — 100% client-side, zero-friction tools
    // (see components/tools/*.jsx and that section's own header notes).
    { path: "/tools/word-counter", changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/json-formatter", changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/case-converter", changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/base64-encoder", changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/password-generator", changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/image-compressor", changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/markdown-editor", changeFrequency: "monthly", priority: 0.7 },
    // The one AI-backed tool in the suite (app/api/ai/process) — still
    // indexable/linkable even on a deployment without GEMINI_API_KEY
    // configured, since the page itself always renders (see that
    // route's and this tool's own graceful-fallback handling).
    { path: "/tools/document-summarizer", changeFrequency: "monthly", priority: 0.7 },
    { path: "/tools/pdf-table-extractor", changeFrequency: "monthly", priority: 0.7 },
    { path: "/market-analysis", changeFrequency: "daily", priority: 0.9 },
    // NOT /market-analysis/ai-news — that route is a 308 permanent
    // redirect to /ai-news now (see app/market-analysis/ai-news/
    // page.jsx), and a sitemap should only ever list final destination
    // URLs. Listing a redirecting URL alongside its own target is the
    // kind of self-contradicting signal Google's own sitemap guidance
    // specifically warns against.
    { path: "/ai-news", changeFrequency: "daily", priority: 0.8 },
    { path: "/embed", changeFrequency: "monthly", priority: 0.5 },
    { path: "/learn", changeFrequency: "weekly", priority: 0.8 },
    { path: "/learn/lab", changeFrequency: "weekly", priority: 0.7 },
    { path: "/community", changeFrequency: "daily", priority: 0.8 },
    { path: "/dashboard", changeFrequency: "weekly", priority: 0.5 },
    { path: "/journal", changeFrequency: "weekly", priority: 0.5 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.3 },
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

  // /converters/<base-code> — Phase 2 base-currency rate digest pages
  // (e.g. /converters/pkr), same dynamic [pair] route as the pair
  // pages below but resolved via parseBaseOnlySlug — see that
  // function's header comment in lib/pairSlugs.js.
  const baseCurrencyDigestRoutes = FEATURED_BASE_CURRENCIES.map((code) => ({
    url: `${siteUrl}/converters/${code.toLowerCase()}`,
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

  // /blog/<slug> — the pSEO/AEO/GEO/LLMO guide posts in lib/blogPosts.js,
  // the same array app/blog/[slug]/page.jsx's generateStaticParams()
  // reads, so this list can never drift out of sync with what's
  // actually pre-rendered. Each post's own `updatedAt` becomes its
  // `lastModified` here, rather than the shared build-time `now` every
  // other route above uses — unlike those, a guide's content genuinely
  // does have a real last-edited date (see lib/blogPosts.js).
  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...converterPairRoutes,
    ...baseCurrencyDigestRoutes,
    ...unitConverterRoutes,
    ...lessonRoutes,
    ...blogRoutes,
  ];
}
