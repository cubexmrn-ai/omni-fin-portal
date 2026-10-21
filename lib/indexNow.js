// lib/indexNow.js
//
// IndexNow (https://www.indexnow.org/) is the open protocol Bing,
// Yandex, Seznam.cz, Naver and a handful of other engines use to
// accept instant-crawl pings — Google is NOT one of them.
//
// IMPORTANT — why this file does not call Google's "Indexing API":
// Google's Indexing API is contractually restricted to pages marked
// up as JobPosting or BroadcastEvent (livestream) content only — see
// Google's own documentation. It is not a general-purpose "index my
// page faster" tool, and Google has suspended API access for sites
// that used it outside that scope. None of this project's pages are
// job postings or livestreams, so wiring a script to call that API
// for /converters/* pages would violate its terms of use, not just be
// ineffective. For Google specifically, the supported levers are: an
// accurate, fresh sitemap.xml (already in place — see app/sitemap.js,
// which both of these endpoints below reuse as their URL source),
// strong internal linking (PopularPairs, the Smart Search CTAs, etc.),
// and — for a genuinely urgent handful of URLs — Search Console's own
// URL Inspection "Request Indexing" tool, used by a person, manually.
// See the Oct 2026 GSC-review conversation this file was added in for
// the fuller reasoning.
//
// USAGE: call pingIndexNow([...urls]) after a deploy that adds or
// changes pSEO slugs. The protected route at app/api/indexnow/route.js
// wraps this with the project's own featured-slug lists so a single
// authenticated POST submits everything. Never call this from a page
// render or generateMetadata — IndexNow expects a handful of calls per
// change, not one per visitor.

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// This key is not a secret — IndexNow's verification model REQUIRES
// publishing it at https://<site>/<key>.txt, so the engine can match
// the ping against a file it can fetch itself. Anyone could read it
// from that public file either way; treating it as an env-var secret
// would just mean public/<key>.txt and the env var drift out of sync.
// The one thing that IS a real secret is INDEXNOW_TRIGGER_SECRET (see
// app/api/indexnow/route.js), which protects who can trigger a ping.
export const INDEXNOW_KEY = "ecc8fa272e152decaaa8ef4672800198";

/**
 * @param {string[]} urls - absolute URLs to submit (IndexNow allows up
 *   to 10,000 per request — comfortably more than this project's
 *   current featured-slug count).
 * @param {string} siteUrl - absolute site origin, e.g.
 *   "https://www.omnifinportal.com" (see lib/siteUrl.js's getSiteUrl()).
 */
export async function pingIndexNow(urls, siteUrl) {
  if (!urls || urls.length === 0) return { submitted: 0 };

  const host = new URL(siteUrl).host;
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });

  // IndexNow returns 200 (or 202) on success and doesn't give a JSON
  // body worth parsing — surfacing status/ok is enough for the caller
  // to log or report back.
  return { submitted: urls.length, status: res.status, ok: res.ok };
}
