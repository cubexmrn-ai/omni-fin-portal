// lib/newsSlug.js
//
// Deterministic, storage-free slugging for individual AI News headlines
// (app/ai-news/[slug]/page.jsx). This project has no database — every
// headline in lib/newsAggregator.js's getAggregatedNews() is ephemeral,
// re-fetched from live RSS feeds and re-ranked on every 15-minute Data
// Cache refresh (lib/cachedData.js's getCachedAggregatedNews()). So a
// permalink here can't be "look up item #123 in a table" the way a real
// CMS would — instead, the slug is PURE FUNCTION of the item's own
// stable fields (source + title + original link), so:
//
//   1. The same headline always produces the same slug, for as long as
//      it keeps appearing in the live feed window (RSS feeds commonly
//      keep an item listed for hours to a few days) — a real, stable
//      URL while the story is current.
//   2. Nothing needs to be written anywhere to "create" a permalink —
//      the hub page (app/ai-news/page.jsx) and the detail route
//      (app/ai-news/[slug]/page.jsx) each independently recompute the
//      same slug from the same live data and arrive at the same URL.
//   3. Once a headline rotates out of the feed entirely, its slug can
//      no longer be matched against anything live — the detail route
//      calls notFound() in that case (a real 404, not a disguised
//      redirect to the hub), which is the honest, Google-guideline-
//      correct way to handle a URL whose content has genuinely expired,
//      and reuses this project's existing branded app/not-found.jsx
//      recovery page rather than inventing new UX for it.
//
// Node's crypto module is fine here — every caller of this file runs
// server-side only (a Server Component or another server-only lib),
// never bundled for the browser.

import crypto from "crypto";

function slugifyPart(text, maxLen) {
  return (text || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/, "");
}

/**
 * Builds this headline's permalink slug. Only `source`, `title`, and
 * `link` feed the result — anything else on the item (excerpt,
 * sentiment, summary, publishedAt) can legitimately change between
 * cache refreshes without changing the URL.
 */
export function buildNewsItemSlug(item) {
  const sourcePart = slugifyPart(item?.source, 24) || "news";
  const titlePart = slugifyPart(item?.title, 70) || "story";
  // A short hash of the original article URL (falling back to the
  // title when a source genuinely has no link, e.g. the mock/offline
  // fallback items) disambiguates same-sounding headlines from
  // different outlets and keeps the slug short and stable rather than
  // encoding the whole URL.
  const hashInput = item?.link || item?.title || "";
  const hash = crypto.createHash("sha1").update(hashInput).digest("hex").slice(0, 8);
  return `${sourcePart}-${titlePart}-${hash}`;
}

/** Attaches a computed `.slug` to every item in a list — used once by
 * app/ai-news/page.jsx so every child component (NewsWireFeed,
 * MacroImpactHero, NewsStructuredData) gets it for free as a plain
 * string prop, with no second slug computation anywhere downstream. */
export function attachNewsItemSlugs(items) {
  return (items || []).map((item) => ({
    // Mock/offline fallback items (lib/newsAggregator.js's
    // MOCK_FALLBACK_ITEMS, `isMock: true`) get no slug at all, not a
    // slug nobody can ever reach. They have no real `link`, and
    // app/ai-news/[slug]/page.jsx filters them out of its own lookup
    // too, so a permalink for one would always 404 anyway — null here
    // means the hub renders them exactly as it already does today
    // (plain, non-clickable text), with zero behavior change to the
    // existing "every live feed is down" fallback UI.
    ...item,
    slug: item.isMock ? null : buildNewsItemSlug(item),
  }));
}

/** Finds the item in a list whose computed slug matches — used by the
 * detail route. Returns null (never throws) when nothing matches,
 * which the caller treats as "this story has rotated out of the live
 * feed" and handles with notFound(). */
export function findNewsItemBySlug(items, slug) {
  if (!slug) return null;
  return (items || []).find((item) => buildNewsItemSlug(item) === slug) || null;
}
