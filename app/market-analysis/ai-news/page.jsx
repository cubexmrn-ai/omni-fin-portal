import { permanentRedirect } from "next/navigation";

// This feature moved to the top-level /ai-news route (now covering
// Forex, Crypto, Commodities and Stocks with search/category filters,
// not just a single flat feed — see app/ai-news/page.jsx). Kept as a
// redirect, rather than deleted outright, so any existing bookmark or
// indexed link to this old nested path still lands somewhere useful
// instead of 404ing.
//
// permanentRedirect() (308), not redirect() (307): the move is
// permanent, so crawlers should transfer this URL's ranking signal to
// /ai-news and stop re-checking the old path, rather than keep both
// URLs indexed as a "temporary" pair. This route is intentionally left
// out of app/sitemap.js — a sitemap should list only final destination
// URLs, never a redirect.
export default function LegacyAiNewsRedirect() {
  permanentRedirect("/ai-news");
}
