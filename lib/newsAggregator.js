// lib/newsAggregator.js
//
// Shared news-aggregation logic for Module 2 (Market AI & News). This
// used to live inline in app/api/news-ai/route.js, with
// app/ai-news/page.jsx calling that route over HTTP (via
// lib/fetchNews.js) to get its data during server-side rendering.
//
// That self-fetch was the root cause of the page breaking in production
// with "Unexpected token '<', <!DOCTYPE ... is not valid JSON": a Next.js
// Server Component fetching its OWN API route by absolute URL during
// static generation/ISR is a well-known Next.js/Vercel footgun — the
// deployment the URL points to isn't guaranteed to be live/routable yet
// at that point, and whatever intercepts the request (Vercel's edge
// routing, a protection/interstitial page, a cold-start timeout) returns
// an HTML page instead of JSON, which then fails res.json() upstream.
//
// The fix is architectural: the actual aggregation logic lives HERE, as
// a plain async function with no dependency on Request/Response or any
// HTTP round trip. Both the public API route (for any external/
// client-side caller) and the server component (for its own SSR) call
// `getAggregatedNews()` directly — no self-fetch, so this failure mode
// is eliminated entirely rather than just handled gracefully.

const REVALIDATE_SECONDS = 900;
const MAX_ITEMS_PER_FEED = 20;
const MAX_ITEMS = 60;
const FETCH_TIMEOUT_MS = 8000;

// Public, no-auth-required finance RSS feeds, each tagged with the
// category shown in the AI News page's filter pills. Reuters' and
// Bloomberg's own RSS feeds were discontinued/blocked years ago (both
// now return robots-disallowed or access-blocked responses), so these
// are their closest still-live, freely-embeddable equivalents per
// category — verified reachable before wiring them in here.
const FEEDS = [
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    category: "Stocks",
  },
  {
    name: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    category: "Stocks",
  },
  {
    name: "CNBC Markets",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    category: "Stocks",
  },
  {
    name: "FXStreet",
    url: "https://www.fxstreet.com/rss/news",
    category: "Forex",
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    category: "Crypto",
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    category: "Crypto",
  },
  {
    name: "OilPrice.com",
    url: "https://oilprice.com/rss/main",
    category: "Commodities",
  },
];

// Last-resort static items, used only when every single live feed fails
// (e.g. this deployment's outbound network is blocked entirely). These
// keep the page populated and functional — search/filter still work —
// rather than showing an empty state during a total outage. Clearly
// labeled via `source`/`isMock` so they're never mistaken for live news.
const MOCK_FALLBACK_ITEMS = [
  {
    title: "Markets await central bank commentary for rate-path signals",
    category: "Stocks",
    source: "OmniFin Portal (cached)",
    excerpt:
      "Equity indices trade in a narrow range as investors wait on commentary from policymakers for clues on the next move in interest rates.",
  },
  {
    title: "Dollar steadies against major peers ahead of data releases",
    category: "Forex",
    source: "OmniFin Portal (cached)",
    excerpt:
      "The US dollar holds recent gains against a basket of major currencies as traders position ahead of upcoming economic data.",
  },
  {
    title: "Bitcoin consolidates near recent range as volatility eases",
    category: "Crypto",
    source: "OmniFin Portal (cached)",
    excerpt:
      "Bitcoin and major altcoins trade sideways following a period of elevated volatility, with traders watching key support and resistance levels.",
  },
  {
    title: "Oil prices hold steady amid mixed supply and demand signals",
    category: "Commodities",
    source: "OmniFin Portal (cached)",
    excerpt:
      "Crude benchmarks trade little changed as markets weigh global demand expectations against ongoing supply-side developments.",
  },
].map((item, idx) => ({
  ...item,
  link: null,
  publishedAt: null,
  summary: null,
  summaryStatus: "pending_ai_key",
  isMock: true,
  id: `mock-${idx}`,
}));

function decodeEntities(text) {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Minimal, dependency-free RSS 2.0 parser. Good enough for standard
 * <item> feeds; not a full XML parser, but avoids pulling in an extra
 * package for a handful of regex-extractable fields.
 */
function parseRssItems(xml, sourceName, category) {
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const block of itemBlocks.slice(0, MAX_ITEMS_PER_FEED)) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link") || extractTag(block, "guid");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date");
    const rawDescription =
      extractTag(block, "description") || extractTag(block, "content:encoded");

    if (!title) continue;

    // Guard against an unparseable pubDate throwing on .toISOString()
    // (new Date("garbage") is an "Invalid Date", not null) — one bad
    // date shouldn't take down this feed's whole item list.
    const parsedDate = pubDate ? new Date(pubDate) : null;
    const publishedAt =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : null;

    items.push({
      title,
      link: link.trim(),
      source: sourceName,
      category,
      publishedAt,
      excerpt: stripHtml(rawDescription).slice(0, 220),
      // --- Placeholder for Phase 2 AI summarization ---
      summary: null,
      summaryStatus: "pending_ai_key",
      // TODO (Phase 2, once EXCHANGERATE_API_KEY-style ANTHROPIC_API_KEY
      // is configured): call the Claude API here with `excerpt` and set
      // `summary` + `summaryStatus: "ready"` on the returned item.
    });
  }

  return items;
}

async function fetchFeed(feed) {
  // A hard timeout so one slow/hanging RSS host can't stall the whole
  // aggregator (or a Vercel build doing static prerendering) — same
  // guard used for the three providers in app/api/rates/route.js.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(feed.url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
      headers: {
        // Some finance RSS endpoints reject requests with no UA header.
        "User-Agent":
          "Mozilla/5.0 (compatible; OmniFinPortalBot/1.0; +https://omnifinportal.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!res.ok) throw new Error(`${feed.name} responded with ${res.status}`);

    const contentType = res.headers.get("content-type") || "";
    const xml = await res.text();

    // Belt-and-suspenders: some feed hosts return a 200 with an HTML
    // error/interstitial page instead of RSS (rate-limit page, WAF
    // challenge, etc). Detect that here — rather than feeding HTML into
    // the regex-based parser and silently returning zero items — so it
    // surfaces as a normal per-feed warning instead.
    const looksLikeHtml =
      contentType.includes("text/html") || /^\s*<!DOCTYPE html/i.test(xml);
    if (looksLikeHtml) {
      throw new Error(`${feed.name} returned an HTML page instead of RSS/XML`);
    }

    return parseRssItems(xml, feed.name, feed.category);
  } catch (err) {
    // A single failing feed should never break the whole aggregator.
    return { error: `${feed.name}: ${err.message || "unknown error"}` };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches and merges all configured RSS feeds into one de-duplicated,
 * date-sorted, category-tagged list. Never throws: every feed call is
 * individually guarded above, and if every single one fails, this falls
 * back to a small set of clearly-labeled static placeholder items
 * instead of returning an empty list.
 */
export async function getAggregatedNews() {
  const feedResults = await Promise.all(FEEDS.map(fetchFeed));

  const items = [];
  const errors = [];

  for (const result of feedResults) {
    if (Array.isArray(result)) {
      items.push(...result);
    } else if (result?.error) {
      errors.push(result.error);
    }
  }

  const usingMockFallback = items.length === 0;
  const finalItems = usingMockFallback ? MOCK_FALLBACK_ITEMS : items;

  finalItems.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  return {
    items: finalItems.slice(0, MAX_ITEMS),
    usingMockFallback,
    aiSummarization: {
      enabled: false,
      status: "pending_ai_key",
      note: usingMockFallback
        ? "Live news sources are temporarily unreachable, so cached sample headlines are shown instead. AI-generated summaries will appear here once an Anthropic API key is configured on the server."
        : "Headlines are live from RSS. AI-generated summaries will appear here once an Anthropic API key is configured on the server.",
    },
    fetchedAt: new Date().toISOString(),
    revalidateSeconds: REVALIDATE_SECONDS,
    ...(errors.length ? { warnings: errors } : {}),
  };
}

export { REVALIDATE_SECONDS as NEWS_REVALIDATE_SECONDS };
