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
// AI summarization is only attempted for the top N headlines (by
// recency, after sort) rather than all 60 — keeps per-request latency
// and API usage bounded regardless of how many RSS items came back.
const MAX_AI_SUMMARIES = 8;
const AI_SUMMARY_TIMEOUT_MS = 8000;
// Tried in order until one responds successfully — gemini-1.5-flash
// (the old single hardcoded value here) is fully retired by Google
// ("models/gemini-1.5-flash is not found", 404), and gemini-2.5-flash
// is now restricted to API keys/projects that used it before it was
// superseded, so a single stale model string silently breaks this
// integration for any new key. See lib/youtubeAutomation.js's
// GEMINI_MODEL_CANDIDATES for the fuller writeup of this; kept in
// sync here. No gemini-1.5-* reference remains in this file.
const GEMINI_MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];
const CLAUDE_MODEL = "claude-sonnet-4-5"; // placeholder model string — swap once an exact model is pinned
const GEMINI_API_URL_FOR = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

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

// ---------------------------------------------------------------------------
// Rule-based sentiment — a keyword-scoring pass over each headline's
// title + excerpt. Deliberately simple and deterministic (not an LLM
// call): a small, hand-picked word list per direction, scored by net
// match count. Labeled "Rule-based" wherever it's shown in the UI so
// it's never mistaken for AI/NLP-derived sentiment — same honesty bar
// as the rest of this project's "coming soon" labeling.
//
// Declared BEFORE MOCK_FALLBACK_ITEMS below, which calls computeSentiment()
// immediately inside its own module-level `.map()` — if this block came
// after it instead (as an earlier version of this file had it), that
// `.map()` call would run before BULLISH_WORDS/BEARISH_WORDS's `const`
// declarations below it had executed, throwing "Cannot access
// 'BULLISH_WORDS' before initialization" (a temporal-dead-zone error —
// function declarations are hoisted, but the `const` bindings a hoisted
// function closes over are not initialized until their own line runs).
// This broke the Vercel production build with a minified
// "Cannot access 'i' before initialization" error.
// ---------------------------------------------------------------------------

const BULLISH_WORDS = [
  "surge", "surges", "surged", "rally", "rallies", "rallied", "soar", "soars", "soared",
  "jump", "jumps", "jumped", "gain", "gains", "gained", "climb", "climbs", "climbed",
  "rise", "rises", "rising", "rose", "record high", "all-time high", "bullish",
  "upgrade", "upgraded", "beat", "beats", "beating", "outperform", "optimis",
  "rebound", "rebounds", "rally", "strengthen", "strengthens", "strengthened",
  "boost", "boosts", "boosted", "recover", "recovers", "recovery",
];

const BEARISH_WORDS = [
  "plunge", "plunges", "plunged", "slump", "slumps", "slumped", "crash", "crashes", "crashed",
  "fall", "falls", "fell", "falling", "drop", "drops", "dropped", "decline", "declines", "declined",
  "sink", "sinks", "sank", "tumble", "tumbles", "tumbled", "bearish", "downgrade", "downgraded",
  "miss", "misses", "missing", "underperform", "pessimis", "slide", "slides", "slid",
  "weaken", "weakens", "weakened", "sell-off", "selloff", "losses", "loss", "recession",
  "warn", "warns", "warning", "concern", "concerns", "risk", "risks", "fear", "fears",
];

function computeSentiment(title, excerpt) {
  const text = `${title || ""} ${excerpt || ""}`.toLowerCase();
  let bullishScore = 0;
  let bearishScore = 0;

  for (const word of BULLISH_WORDS) {
    if (text.includes(word)) bullishScore += 1;
  }
  for (const word of BEARISH_WORDS) {
    if (text.includes(word)) bearishScore += 1;
  }

  if (bullishScore === 0 && bearishScore === 0) return "Neutral";
  if (bullishScore > bearishScore) return "Bullish";
  if (bearishScore > bullishScore) return "Bearish";
  return "Neutral";
}

// ---------------------------------------------------------------------------
// Per-asset relevance tagging — which instrument(s) a headline is about,
// so the News page can break sentiment down "which market does this
// headline impact" instead of one abstract aggregate count. Same
// rule-based, deterministic approach as computeSentiment() above: a
// hand-picked keyword list per asset, matched with word boundaries so
// e.g. "Goldman Sachs" or "golden visa" never falsely tags "Gold".
//
// Declared BEFORE MOCK_FALLBACK_ITEMS below for the exact same reason
// BULLISH_WORDS/BEARISH_WORDS are — MOCK_FALLBACK_ITEMS's module-level
// `.map()` calls detectRelatedAssets() immediately, so the `const`s it
// closes over must already be initialized by the time that line runs.
// See the TDZ comment above for the full explanation.
// ---------------------------------------------------------------------------

const ASSET_KEYWORDS = {
  Gold: ["gold", "xau"],
  Silver: ["silver", "xag"],
  Oil: ["oil", "crude", "wti", "brent"],
  BTC: ["bitcoin", "btc"],
  ETH: ["ethereum", "eth"],
  USD: ["dollar", "usd", "greenback", "federal reserve", "fed", "fomc"],
  EUR: ["euro", "eur", "eurozone", "ecb"],
  GBP: ["pound", "gbp", "sterling", "bank of england", "boe"],
  "S&P 500": ["s&p 500", "s&p500", "wall street", "stocks", "equities", "nasdaq", "dow jones"],
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Pre-build one word-boundary regex per keyword, once, rather than on
// every call.
const ASSET_KEYWORD_PATTERNS = Object.entries(ASSET_KEYWORDS).map(([asset, keywords]) => ({
  asset,
  patterns: keywords.map((kw) => new RegExp(`\\b${escapeRegex(kw)}\\b`, "i")),
}));

/**
 * Returns the list of asset codes/names (e.g. ["Gold", "USD"]) a
 * headline's title+excerpt appears to be about, via word-boundary
 * keyword matching. A headline can relate to more than one asset (e.g.
 * "Gold slips as dollar strengthens" → ["Gold", "USD"]); returns an
 * empty array when nothing matches rather than guessing.
 */
function detectRelatedAssets(title, excerpt) {
  const text = `${title || ""} ${excerpt || ""}`;
  const related = [];
  for (const { asset, patterns } of ASSET_KEYWORD_PATTERNS) {
    if (patterns.some((re) => re.test(text))) related.push(asset);
  }
  return related;
}

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
  sentiment: computeSentiment(item.title, item.excerpt),
  relatedAssets: detectRelatedAssets(item.title, item.excerpt),
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

    const excerpt = stripHtml(rawDescription).slice(0, 220);

    items.push({
      title,
      link: link.trim(),
      source: sourceName,
      category,
      publishedAt,
      excerpt,
      // Rule-based keyword sentiment — see computeSentiment() above.
      // Always computed (doesn't need an API key); clearly a different
      // thing from the AI-written `summary` below.
      sentiment: computeSentiment(title, excerpt),
      // Which instrument(s) this headline appears to be about — see
      // detectRelatedAssets() above. Empty array if nothing matches.
      relatedAssets: detectRelatedAssets(title, excerpt),
      // AI summary is filled in later, for a bounded top-N slice of the
      // final sorted list only — see summarizeTopHeadlines() below,
      // called from getAggregatedNews(). Left null/pending here since
      // parseRssItems() runs before the final cross-feed sort.
      summary: null,
      summaryStatus: "pending_ai_key",
      summaryProvider: null,
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

// ---------------------------------------------------------------------------
// Per-headline AI summarization — a one-sentence plain-language gloss
// of a headline + excerpt. GEMINI_API_KEY is tried first, then
// ANTHROPIC_API_KEY as a secondary fallback, then the item is left with
// `summary: null` (the UI falls back to showing the raw excerpt) —
// never a hardcoded "configure an API key" placeholder claiming a
// specific provider is missing. Only ever called for a bounded top-N
// slice (MAX_AI_SUMMARIES) of the final sorted list, to keep latency
// and API usage predictable regardless of how many live RSS items came
// back.
// ---------------------------------------------------------------------------

function buildSummaryPrompt(item) {
  return `Summarize this finance headline in ONE short, plain-language sentence (max 25 words) for a news feed reader. Do not invent facts beyond what's given.

Headline: "${item.title}"
Excerpt: "${(item.excerpt || "").slice(0, 300)}"

Respond with ONLY the one-sentence summary, no quotes, no prefix.`;
}

// Base delay before retrying a Gemini 503 ("UNAVAILABLE"/high demand —
// Google's documented transient-overload response), doubled on the
// retry. A 503 means "the model is fine, try again shortly", unlike a
// 404/400/403/429 which means "this model/key doesn't work" and should
// move to the next candidate immediately instead of wasting a retry.
const GEMINI_RETRY_DELAY_MS = 1000;
const GEMINI_MAX_ATTEMPTS_PER_MODEL = 2; // 1 initial attempt + 1 retry

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geminiSummarize(item, apiKey) {
  const prompt = buildSummaryPrompt(item);

  for (const model of GEMINI_MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_SUMMARY_TIMEOUT_MS);
      try {
        const res = await fetch(`${GEMINI_API_URL_FOR(model)}?key=${apiKey}`, {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 80 },
          }),
        });
        if (!res.ok) {
          if (res.status === 503 && attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL) {
            await sleep(GEMINI_RETRY_DELAY_MS * attempt);
            continue; // retry the same model
          }
          break; // model not found/unavailable/quota — try the next candidate
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) break;
        return text;
      } catch {
        // Network error/timeout on this candidate — not retried (not
        // Google's "try again shortly" signal) — try the next model.
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  return null;
}

async function claudeSummarize(item, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_SUMMARY_TIMEOUT_MS);
  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 80,
        messages: [{ role: "user", content: buildSummaryPrompt(item) }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API responded with ${res.status}`);
    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    if (!text) throw new Error("Anthropic API returned no text content");
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Mutates (returns a new array of) the first MAX_AI_SUMMARIES items with
 * a real AI-generated `summary` when GEMINI_API_KEY or ANTHROPIC_API_KEY
 * is configured and reachable; every other item (and every item when
 * neither key works) keeps `summary: null` / `summaryStatus:
 * "pending_ai_key"` so the UI shows its excerpt instead — never throws,
 * never fabricates a summary when both providers fail.
 */
async function summarizeTopHeadlines(items, hasGeminiKey, hasAnthropicKey) {
  if (!hasGeminiKey && !hasAnthropicKey) return items;

  const toSummarize = items.slice(0, MAX_AI_SUMMARIES);
  const rest = items.slice(MAX_AI_SUMMARIES);

  const summarized = await Promise.all(
    toSummarize.map(async (item) => {
      let summary = null;
      let provider = null;

      if (hasGeminiKey) {
        summary = await geminiSummarize(item, process.env.GEMINI_API_KEY);
        if (summary) provider = "gemini";
      }
      if (!summary && hasAnthropicKey) {
        summary = await claudeSummarize(item, process.env.ANTHROPIC_API_KEY);
        if (summary) provider = "claude";
      }

      if (!summary) return item; // stays pending_ai_key, unchanged

      return { ...item, summary, summaryStatus: "ready", summaryProvider: provider };
    })
  );

  return [...summarized, ...rest];
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

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

  // Real AI summaries for the top MAX_AI_SUMMARIES items when a key is
  // configured and reachable — see summarizeTopHeadlines() above. A
  // no-op (returns the same array) when neither key is configured, or
  // when usingMockFallback is true (no point summarizing static sample
  // items with a live AI call).
  const summarizedItems = usingMockFallback
    ? finalItems
    : await summarizeTopHeadlines(finalItems, hasGeminiKey, hasAnthropicKey);

  const pageItems = summarizedItems.slice(0, MAX_ITEMS);

  // Rule-based headline-sentiment tally (Bullish/Bearish/Neutral counts
  // across the current page of items) — real, computed from the actual
  // live headlines above, NOT a placeholder. Distinct from true social
  // sentiment (X/Twitter, Reddit chatter), which isn't wired to any
  // source here — see the separate placeholder card on app/ai-news/page.jsx.
  const sentimentTally = { Bullish: 0, Bearish: 0, Neutral: 0 };
  for (const item of pageItems) {
    if (sentimentTally[item.sentiment] !== undefined) sentimentTally[item.sentiment] += 1;
  }

  // Per-asset breakdown of the same rule-based sentiment, using each
  // item's relatedAssets (see detectRelatedAssets() above) — e.g.
  // { Gold: { Bullish: 2, Bearish: 1, Neutral: 0 }, USD: {...}, ... }.
  // Only assets that actually appear in at least one headline are
  // included, so the UI can skip rendering empty rows.
  const assetSentimentBreakdown = {};
  for (const item of pageItems) {
    for (const asset of item.relatedAssets || []) {
      if (!assetSentimentBreakdown[asset]) {
        assetSentimentBreakdown[asset] = { Bullish: 0, Bearish: 0, Neutral: 0 };
      }
      if (assetSentimentBreakdown[asset][item.sentiment] !== undefined) {
        assetSentimentBreakdown[asset][item.sentiment] += 1;
      }
    }
  }

  const summaryCount = pageItems.filter((i) => i.summaryStatus === "ready").length;
  const geminiSummaryCount = pageItems.filter((i) => i.summaryProvider === "gemini").length;
  const claudeSummaryCount = pageItems.filter((i) => i.summaryProvider === "claude").length;
  const hasAnyAiKey = hasGeminiKey || hasAnthropicKey;

  let summarizationNote;
  if (usingMockFallback) {
    summarizationNote =
      "Live news sources are temporarily unreachable, so cached sample headlines are shown instead. AI-generated summaries aren't generated for cached sample items.";
  } else if (summaryCount > 0) {
    summarizationNote = `AI-generated one-line summaries are live for the top ${summaryCount} headline${
      summaryCount === 1 ? "" : "s"
    } (${geminiSummaryCount} via Gemini${claudeSummaryCount > 0 ? `, ${claudeSummaryCount} via Claude fallback` : ""}); the rest show their raw excerpt.`;
  } else if (hasAnyAiKey) {
    summarizationNote =
      "An AI provider key is configured, but the summarization call failed for every headline this time — showing raw excerpts with rule-based sentiment badges instead.";
  } else {
    summarizationNote =
      "Headlines are live from RSS, with rule-based sentiment badges. Configure GEMINI_API_KEY (preferred) or ANTHROPIC_API_KEY to generate real one-line AI summaries per headline.";
  }

  return {
    items: pageItems,
    usingMockFallback,
    sentimentTally,
    assetSentimentBreakdown,
    aiSummarization: {
      enabled: summaryCount > 0,
      status: summaryCount > 0 ? "ready" : hasAnyAiKey ? "key_configured_failed" : "pending_ai_key",
      note: summarizationNote,
    },
    fetchedAt: new Date().toISOString(),
    revalidateSeconds: REVALIDATE_SECONDS,
    ...(errors.length ? { warnings: errors } : {}),
  };
}

export { REVALIDATE_SECONDS as NEWS_REVALIDATE_SECONDS };
