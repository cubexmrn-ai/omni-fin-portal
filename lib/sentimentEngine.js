// lib/sentimentEngine.js
//
// Standalone, framework-agnostic "Macro Sentiment Engine". This module
// has ZERO Next.js imports and never touches Request/Response — it is
// deliberately kept as a plain set of exported (async) functions so it
// can be lifted out and reused as a standalone tool elsewhere, per the
// project's "standalone & modular backend architecture" requirement.
// The only framework-side wiring lives in app/api/sentiment-engine/route.js
// and app/market-analysis/page.jsx, both of which just call the
// functions below directly.
//
// WHAT THIS DOES, HONESTLY:
//   1. For each tracked asset, generates a rotating set of 4-6
//      "contextual themes" — the macro narratives/search terms currently
//      relevant to that asset (rate-path shifts, geopolitical risk,
//      inventory data, ETF flows, etc). GEMINI_API_KEY is tried FIRST
//      (Google's Gemini API, plain REST, no SDK dependency); if that's
//      not configured or fails, ANTHROPIC_API_KEY (Claude) is tried as
//      a secondary fallback — either path makes the themes genuinely
//      AI-generated and current. Otherwise (neither key, or both calls
//      fail/time out) it falls back to rotating a *pool* of 12-20
//      per-asset-class theme candidates, selected deterministically by a
//      seeded PRNG keyed to the asset + current UTC hour — never the
//      exact same rigid list twice in a row, but also never claimed to
//      be "AI-generated" when it isn't.
//   2. For each asset, computes a deterministic "retail sentiment" score
//      and a separate "institutional/central-bank bias" score, using a
//      seeded-PRNG-by-date-hour-bucket technique — these are explicitly labeled
//      as a deterministic simulation, not a real measurement, unless/
//      until a real data provider is wired up (checks for a
//      SENTIMENT_DATA_API_KEY-style env var using the same honest
//      "configured but not wired up yet" pattern as the rest of this
//      project). A `divergence` field flags when retail and
//      institutional positioning disagree.
//   3. Groups the universe into four human-readable "market blog" posts
//      (Gold, WTI Crude Oil, the Dollar Index, and Crypto) and writes a
//      150-200 word, human-sounding market-commentary paragraph for
//      each one — blending that group's rotating themes and its
//      retail/institutional sentiment numbers into readable prose,
//      rather than a bare JSON dump. GEMINI_API_KEY is tried first (the
//      same provider order as themes above), ANTHROPIC_API_KEY second,
//      and a template-assembled paragraph (still built FROM the same
//      real computed numbers/themes, just stitched together with
//      fixed sentence scaffolding instead of free-form AI prose) is the
//      final fallback — never a bare "AI blog coming soon" placeholder.
//      These feed both MacroSentimentEnginePanel.jsx and a rotating
//      snippet in the sticky bottom ticker (components/
//      StickyBottomTicker.jsx) on market pages.
//
// This module intentionally defines its own hashString()/mulberry32()
// rather than importing them from elsewhere, specifically so it has no
// dependency on anything else in this repo and can be copy-pasted
// elsewhere as-is.

export const SENTIMENT_ASSET_UNIVERSE = [
  { code: "XAUUSD", label: "Gold (XAU/USD)", assetClass: "metals" },
  { code: "XAGUSD", label: "Silver (XAG/USD)", assetClass: "metals" },
  { code: "WTI", label: "WTI Crude Oil", assetClass: "energy" },
  { code: "NATGAS", label: "Natural Gas", assetClass: "energy" },
  { code: "DXY", label: "US Dollar Index (DXY)", assetClass: "forex" },
  { code: "EURUSD", label: "EUR/USD", assetClass: "forex" },
  { code: "GBPUSD", label: "GBP/USD", assetClass: "forex" },
  { code: "BTC", label: "Bitcoin (BTC)", assetClass: "crypto" },
  { code: "ETH", label: "Ethereum (ETH)", assetClass: "crypto" },
];

const AI_THEME_TIMEOUT_MS = 8000;
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

// ---------------------------------------------------------------------------
// Shared deterministic-simulation helpers, defined locally (not
// imported from elsewhere) so this module stays fully standalone. See
// the header comment above for why.
// ---------------------------------------------------------------------------

/** Simple deterministic string hash (djb2 variant) — no crypto needed. */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned
}

/** A tiny deterministic PRNG (mulberry32) seeded from a 32-bit integer. */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Current UTC date-hour bucket, e.g. "2026-10-10T14" — stable within an
 * hour, so simulated values don't jitter on every request. */
function currentHourBucket() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(
    now.getUTCDate()
  ).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Per-asset-class theme pools — a reasonably large, varied set of
// candidate macro narratives per asset class. These are NOT shown
// verbatim as a rigid list: generateContextualThemes() below rotates a
// pseudo-random 4-6 item subset of the relevant pool, seeded by
// asset+hour, so the same exact set is never shown twice in a row even
// without an AI key.
// ---------------------------------------------------------------------------

const THEME_POOLS = {
  metals: [
    "Safe-haven demand amid geopolitical risk headlines",
    "Real yields and their inverse pull on non-yielding metals",
    "Central bank gold reserve accumulation trends",
    "ETF flow data (inflows/outflows) for metals-backed funds",
    "US dollar strength/weakness as the primary pricing cross-current",
    "Inflation-hedge positioning ahead of CPI/PCE prints",
    "Industrial demand signals (solar, electronics) for silver specifically",
    "Mine supply disruptions and production guidance updates",
    "Retail coin/bar demand trends in major consumer markets",
    "Futures market net-long/net-short positioning (COT report themes)",
    "Fed rate-path expectations and their effect on opportunity cost",
    "Gold-to-silver ratio mean-reversion chatter",
    "Jewelry demand seasonality in key importing economies",
    "Risk-off rotation out of equities into hard assets",
    "Sovereign debt and currency-debasement narratives",
    "Physical delivery and vault-inventory reporting anomalies",
  ],
  energy: [
    "OPEC+ production quota decisions and compliance signals",
    "US crude/product inventory data (EIA/API) surprises",
    "Geopolitical supply-risk premium (shipping lanes, producer-region conflict)",
    "Global demand growth forecasts from IEA/OPEC monthly reports",
    "US dollar strength as a cross-current on dollar-denominated pricing",
    "Refinery utilization rates and seasonal maintenance schedules",
    "Strategic petroleum reserve release/replenishment chatter",
    "Rig count and US shale production growth trends",
    "Natural gas storage levels vs. five-year seasonal average",
    "LNG export capacity and winter-demand weather forecasts",
    "EV adoption curves and their long-run demand-destruction narrative",
    "Recession-risk demand concerns weighing on the complex",
    "Pipeline/infrastructure bottleneck headlines",
    "Speculative futures positioning swings (managed money net length)",
    "Currency-linked producer-nation fiscal breakeven pressures",
    "Renewables buildout pace as a substitution narrative",
  ],
  forex: [
    "Central bank rate-path divergence (hike/hold/cut expectations)",
    "Inflation print surprises shifting policy-pivot timing bets",
    "Risk-on/risk-off flows into or out of the currency as a funding leg",
    "Retail positioning skew (crowded long/short) on major FX platforms",
    "Current account and trade-balance deterioration/improvement themes",
    "Political/fiscal-policy headline risk (elections, budget standoffs)",
    "Carry-trade unwind/rebuild chatter tied to rate differentials",
    "Central bank verbal intervention or rate-check commentary",
    "Safe-haven demand during broader market stress episodes",
    "PMI and employment data surprises relative to consensus",
    "Cross-asset correlation with equities/commodities",
    "Speculative futures positioning (CFTC COT-style net exposure)",
    "Energy-import-cost sensitivity for the domestic currency",
    "Yield-curve shifts in the underlying sovereign debt market",
    "Options market skew signaling directional hedging demand",
    "Technical level defense/break chatter among short-term traders",
  ],
  crypto: [
    "Spot ETF flow data (inflows/outflows) from major issuers",
    "On-chain whale-wallet accumulation or distribution signals",
    "Exchange net-flow trends (inflow to exchanges = sell pressure narrative)",
    "Regulatory headline risk (SEC/CFTC/global regulator actions)",
    "Macro risk-on/risk-off correlation with equities and real yields",
    "Network activity metrics (active addresses, gas fees, staking ratio)",
    "Derivatives funding-rate and open-interest positioning extremes",
    "Mining/validator economics and hash-rate or staking trend shifts",
    "Institutional custody and treasury-allocation announcements",
    "Retail sentiment extremes (fear/greed-style positioning chatter)",
    "Layer-2/protocol-upgrade narrative catalysts",
    "Stablecoin supply growth as a liquidity proxy",
    "Correlation-breakdown-from-gold (\"digital gold\" narrative) chatter",
    "Leverage-driven liquidation cascade risk after sharp moves",
    "Cross-chain and DeFi total-value-locked trend shifts",
    "Historical halving-cycle or supply-schedule narrative framing",
  ],
};

function pickRotatingThemes(asset, hourBucket) {
  const pool = THEME_POOLS[asset.assetClass] || THEME_POOLS.forex;
  const seed = hashString(`theme-pool|${asset.code}|${hourBucket}`);
  const rand = mulberry32(seed);

  // Fisher-Yates-style partial shuffle using the seeded PRNG, then take
  // a rotating count (4-6) from the front — deterministic for the hour,
  // but a different subset/order each hour.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const count = 4 + Math.floor(rand() * 3); // 4, 5, or 6
  return shuffled.slice(0, count);
}

function buildThemePrompt(asset) {
  return `You track macro market narratives. For the asset "${asset.label}" (${asset.assetClass}), list 4 to 6 current, plausible, contextually-relevant macro themes or search terms that would be driving sentiment/discussion around it right now (e.g. central bank rate-path shifts, geopolitical events, retail positioning bias, inventory/supply data for commodities, as appropriate to the asset class). Respond with ONLY a JSON array of short strings, no prose, no markdown fences.`;
}

function parseThemeList(text) {
  if (!text) throw new Error("AI provider returned no text content");
  // Be lenient about stray markdown fences/prose around the JSON.
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI provider returned an unexpected/empty theme list");
  }
  const themes = parsed.filter((t) => typeof t === "string" && t.trim()).slice(0, 6);
  if (themes.length === 0) throw new Error("AI provider returned no usable theme strings");
  return themes;
}

/**
 * Attempts a real Gemini API call (Google AI Studio's plain REST
 * endpoint — no SDK dependency) for this asset's contextual themes.
 * Returns `null` on any failure (missing key, network error, timeout,
 * bad response shape) so the caller falls through to the Claude path
 * or the rotating-pool fallback — never throws.
 */
async function geminiThemes(asset, apiKey) {
  const prompt = buildThemePrompt(asset);

  for (const model of GEMINI_MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_THEME_TIMEOUT_MS);
      try {
        const res = await fetch(`${GEMINI_API_URL_FOR(model)}?key=${apiKey}`, {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 400 },
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
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = parseThemeList(text);
        if (parsed && parsed.length > 0) return parsed;
        break;
      } catch {
        // Network error/timeout — not retried — try the next model.
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  return null;
}

/**
 * Attempts a real Claude API call for this asset's contextual themes.
 * Returns `null` on any failure (missing key, network error, timeout,
 * bad response shape) so the caller falls through to the rotating-pool
 * fallback — never throws.
 */
async function claudeThemes(asset, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_THEME_TIMEOUT_MS);
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
        max_tokens: 400,
        messages: [{ role: "user", content: buildThemePrompt(asset) }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API responded with ${res.status}`);

    const data = await res.json();
    const text = data?.content?.[0]?.text || "";
    return parseThemeList(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns { themes: string[], usingAi: boolean, provider: "gemini" |
 * "claude" | null } for a given asset.
 *
 * Provider order: GEMINI_API_KEY first (if configured), then
 * ANTHROPIC_API_KEY as a secondary fallback (if configured and Gemini
 * didn't produce a usable result). On no key OR both failing, falls
 * back to the non-rigid rotating theme-pool selection above — never
 * throws.
 */
export async function generateContextualThemes(asset) {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

  if (hasGeminiKey) {
    const themes = await geminiThemes(asset, process.env.GEMINI_API_KEY);
    if (themes) return { themes, usingAi: true, provider: "gemini" };
  }

  if (hasAnthropicKey) {
    const themes = await claudeThemes(asset, process.env.ANTHROPIC_API_KEY);
    if (themes) return { themes, usingAi: true, provider: "claude" };
  }

  const hourBucket = currentHourBucket();
  return { themes: pickRotatingThemes(asset, hourBucket), usingAi: false, provider: null };
}

// ---------------------------------------------------------------------------
// Deterministic retail/institutional sentiment simulation — a
// seeded-PRNG-by-date-hour-bucket technique, with a distinct seed
// prefix ("sentiment-engine|") so these numbers are never accidentally
// identical to another module's simulation using the same approach.
// ---------------------------------------------------------------------------

function simulateSentimentScores(asset, hourBucket) {
  const retailSeed = hashString(`sentiment-engine|retail|${asset.code}|${hourBucket}`);
  const institutionalSeed = hashString(
    `sentiment-engine|institutional|${asset.code}|${hourBucket}`
  );

  const retailRand = mulberry32(retailSeed);
  const institutionalRand = mulberry32(institutionalSeed);

  const retailSentiment = Math.round(retailRand() * 100);
  const institutionalBias = Math.round(institutionalRand() * 100);

  let divergence = "aligned";
  if (Math.abs(retailSentiment - institutionalBias) > 15) {
    divergence =
      retailSentiment > institutionalBias
        ? "retail-bullish-institutional-bearish"
        : "retail-bearish-institutional-bullish";
  }

  return { retailSentiment, institutionalBias, divergence };
}

function safeFallbackAssetEntry(asset) {
  return {
    code: asset.code,
    label: asset.label,
    assetClass: asset.assetClass,
    retailSentiment: 50,
    institutionalBias: 50,
    divergence: "aligned",
    themes: [],
    usingAiThemes: false,
    themeProvider: null,
  };
}

// ---------------------------------------------------------------------------
// Human-readable market blogs — one per group, blending that group's
// computed sentiment numbers + rotating themes into a 150-200 word
// market-commentary paragraph. See the header comment (section 3) for
// provider order and the fallback guarantee.
// ---------------------------------------------------------------------------

const AI_BLOG_TIMEOUT_MS = 10000;
const BLOG_WORD_TARGET = "150-200";

// The four groups the user asked for: Gold, WTI Crude Oil, the Dollar
// Index, and Crypto (BTC+ETH combined into one blog, since the ask was
// for "Crypto" as a single class, not two separate BTC/ETH posts).
const MARKET_BLOG_GROUPS = [
  { id: "gold", title: "Gold (XAU/USD)", codes: ["XAUUSD"] },
  { id: "wti", title: "WTI Crude Oil", codes: ["WTI"] },
  { id: "dxy", title: "US Dollar Index (DXY)", codes: ["DXY"] },
  { id: "crypto", title: "Crypto (BTC & ETH)", codes: ["BTC", "ETH"] },
];

function buildBlogPrompt(group, groupAssets) {
  const assetLines = groupAssets
    .map(
      (a) =>
        `- ${a.label}: retail sentiment ${a.retailSentiment}/100, institutional/CB bias ${
          a.institutionalBias
        }/100 (${a.divergence}); themes in play: ${a.themes.join("; ")}`
    )
    .join("\n");

  return `You are a markets commentator writing a short blog post for a finance news site. Write a human-sounding, ${BLOG_WORD_TARGET} word market commentary paragraph about "${group.title}", using ONLY the data points below — do not invent specific prices, percentages, or events not implied by this data.

${assetLines}

Write it as flowing prose (not bullet points), in a confident-but-measured market-commentary tone. You may reference the retail-vs-institutional divergence narratively (e.g. "retail traders lean more bullish than institutional positioning suggests") without restating the raw numbers verbatim. End with one sentence noting this is a sentiment snapshot, not financial advice. Respond with ONLY the paragraph text, no title, no markdown.`;
}

async function geminiBlog(group, groupAssets, apiKey) {
  const prompt = buildBlogPrompt(group, groupAssets);

  for (const model of GEMINI_MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_BLOG_TIMEOUT_MS);
      try {
        const res = await fetch(`${GEMINI_API_URL_FOR(model)}?key=${apiKey}`, {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500 },
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
        // Network error/timeout — not retried — try the next model.
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  return null;
}

async function claudeBlog(group, groupAssets, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_BLOG_TIMEOUT_MS);
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
        max_tokens: 500,
        messages: [{ role: "user", content: buildBlogPrompt(group, groupAssets) }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API responded with ${res.status}`);
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
 * Builds a complete, well-formed market-commentary paragraph purely
 * from already-computed data (no LLM) — sentence-template scaffolding
 * around each asset's real retail/institutional scores, divergence,
 * and rotating themes. Used whenever neither AI provider is configured
 * or both calls fail, so the blog section is never empty or a bare
 * "coming soon" placeholder.
 */
function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Generic, honest filler sentences used only to nudge a templated blog
// up toward the 150-200 word target when the core content sentences
// alone fall short (typically a single-asset group like Gold/WTI/DXY).
// Never invents a number or event — purely framing/context language.
const BLOG_PADDING_SENTENCES = [
  (group) =>
    `As always with positioning data, the read can shift quickly once new macro data or a policy surprise lands, so this snapshot is best treated as a starting point rather than a fixed view.`,
  (group) =>
    `Traders watching ${group.title} into the next session will likely weigh this positioning backdrop alongside whatever headlines move the broader risk tone.`,
  (group) =>
    `None of the themes above are mutually exclusive — several can be driving price action on ${group.title} at the same time, which is part of why positioning reads can diverge.`,
];

function templatedBlog(group, groupAssets) {
  const sentences = [];

  const names = groupAssets.map((a) => a.label).join(" and ");
  sentences.push(
    `${group.title} sentiment is mixed heading into the session, with retail and institutional positioning telling slightly different stories across ${names}.`
  );

  for (const asset of groupAssets) {
    const lean = asset.retailSentiment >= 50 ? "leaning bullish" : "leaning cautious";
    const instLean = asset.institutionalBias >= 50 ? "a constructive tilt" : "a more defensive tilt";
    const divergenceSentence =
      asset.divergence === "aligned"
        ? `Retail positioning (${asset.retailSentiment}/100) and the institutional/central-bank-leaning read (${asset.institutionalBias}/100) are broadly aligned for now.`
        : asset.divergence === "retail-bullish-institutional-bearish"
        ? `Retail flow is notably more upbeat (${asset.retailSentiment}/100) than the institutional/central-bank-leaning read (${asset.institutionalBias}/100), a gap worth watching if it widens further.`
        : `Institutional positioning (${asset.institutionalBias}/100) is running ahead of a more cautious retail crowd (${asset.retailSentiment}/100), which can resolve either way as the larger flows assert themselves.`;

    sentences.push(
      `${asset.label} retail traders are ${lean} while the institutional read shows ${instLean}. ${divergenceSentence}`
    );

    if (asset.themes.length > 0) {
      sentences.push(
        `The narratives driving the conversation right now include ${asset.themes
          .slice(0, 3)
          .join(", ")}.`
      );
    }
  }

  // One shared context sentence for the group as a whole (not per
  // asset) — keeps a two-asset group like Crypto from running long
  // purely because it has twice as many per-asset sentences.
  const anyDiverging = groupAssets.some((a) => a.divergence !== "aligned");
  sentences.push(
    anyDiverging
      ? `A gap this size between retail and institutional reads is worth watching — it tends to narrow either through a retail capitulation or a shift in the larger flows.`
      : `With both camps broadly on the same page for now, near-term moves are more likely to be driven by incoming data than by a positioning unwind.`
  );

  const disclaimer =
    "This is a sentiment snapshot built from simulated positioning data and rotating contextual themes, not financial advice.";

  // Nudge toward the 150-200 word target: pad up if short (never past
  // 200 with the disclaimer included), trim down if long, by adding or
  // removing whole sentences rather than truncating mid-sentence.
  let paddingIndex = 0;
  while (
    wordCount(sentences.join(" ") + " " + disclaimer) < 150 &&
    paddingIndex < BLOG_PADDING_SENTENCES.length
  ) {
    sentences.push(BLOG_PADDING_SENTENCES[paddingIndex](group));
    paddingIndex += 1;
  }

  while (wordCount(sentences.join(" ") + " " + disclaimer) > 200 && sentences.length > 2) {
    sentences.splice(sentences.length - 1, 1);
  }

  sentences.push(disclaimer);

  return sentences.join(" ");
}

/**
 * Builds the four market-blog posts (Gold, WTI, DXY, Crypto) from an
 * already-computed `assets` array (the same one getSentimentEngineSnapshot()
 * returns). Provider order per post: GEMINI_API_KEY, then
 * ANTHROPIC_API_KEY, then the templated fallback above — never throws,
 * and a post is always produced for every group even if its underlying
 * asset lookup comes up short (falls back to a safe stub group).
 */
async function generateMarketBlogs(assets) {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const byCode = Object.fromEntries(assets.map((a) => [a.code, a]));

  const blogs = await Promise.all(
    MARKET_BLOG_GROUPS.map(async (group) => {
      const groupAssets = group.codes.map((code) => byCode[code]).filter(Boolean);

      if (groupAssets.length === 0) {
        return {
          id: group.id,
          title: group.title,
          body: `${group.title} market commentary is unavailable right now — please check back shortly.`,
          wordCount: 0,
          usingAi: false,
          aiProvider: null,
        };
      }

      let body = null;
      let aiProvider = null;

      if (hasGeminiKey) {
        body = await geminiBlog(group, groupAssets, process.env.GEMINI_API_KEY);
        if (body) aiProvider = "gemini";
      }
      if (!body && hasAnthropicKey) {
        body = await claudeBlog(group, groupAssets, process.env.ANTHROPIC_API_KEY);
        if (body) aiProvider = "claude";
      }
      if (!body) {
        body = templatedBlog(group, groupAssets);
        aiProvider = null;
      }

      return {
        id: group.id,
        title: group.title,
        body,
        wordCount: wordCount(body),
        usingAi: Boolean(aiProvider),
        aiProvider,
      };
    })
  );

  return blogs;
}

/**
 * Builds the full Macro Sentiment Engine snapshot across
 * SENTIMENT_ASSET_UNIVERSE. Never throws: every asset is processed
 * inside its own try/catch, so one bad asset falls back to a minimal
 * safe entry rather than aborting the whole snapshot.
 */
export async function getSentimentEngineSnapshot() {
  const hourBucket = currentHourBucket();
  const hasSentimentDataApiKey = Boolean(process.env.SENTIMENT_DATA_API_KEY);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

  const assets = [];
  const providerCounts = { gemini: 0, claude: 0 };

  for (const asset of SENTIMENT_ASSET_UNIVERSE) {
    try {
      const { themes, usingAi, provider } = await generateContextualThemes(asset);
      const { retailSentiment, institutionalBias, divergence } = simulateSentimentScores(
        asset,
        hourBucket
      );

      if (provider === "gemini") providerCounts.gemini += 1;
      if (provider === "claude") providerCounts.claude += 1;

      assets.push({
        code: asset.code,
        label: asset.label,
        assetClass: asset.assetClass,
        retailSentiment,
        institutionalBias,
        divergence,
        themes,
        usingAiThemes: usingAi,
        themeProvider: provider,
      });
    } catch {
      // Per-asset safety net — never let one asset's failure take down
      // the whole snapshot.
      assets.push(safeFallbackAssetEntry(asset));
    }
  }

  const usingGeminiThemes = hasGeminiKey && providerCounts.gemini > 0;
  const usingClaudeThemes = hasAnthropicKey && providerCounts.claude > 0;
  const usingAiThemes = usingGeminiThemes || usingClaudeThemes;
  const hasAnyAiKey = hasGeminiKey || hasAnthropicKey;

  let note;
  if (usingGeminiThemes) {
    note = `Themes for ${providerCounts.gemini} asset${
      providerCounts.gemini === 1 ? "" : "s"
    } were generated live by the Gemini API${
      providerCounts.claude > 0 ? ` (${providerCounts.claude} via Claude fallback)` : ""
    }; retail/institutional sentiment scores are a deterministic simulation (seeded hourly), not a real measurement — no live positioning/sentiment data provider is connected yet.`;
  } else if (usingClaudeThemes) {
    note = `Themes for ${providerCounts.claude} asset${
      providerCounts.claude === 1 ? "" : "s"
    } were generated live by the Claude API (GEMINI_API_KEY was not used successfully for any asset); retail/institutional sentiment scores are a deterministic simulation (seeded hourly), not a real measurement — no live positioning/sentiment data provider is connected yet.`;
  } else if (hasAnyAiKey) {
    note = `${
      hasGeminiKey ? "A GEMINI_API_KEY" : "An ANTHROPIC_API_KEY"
    } is configured, but the live theme-generation call failed for every asset — showing themes rotated from a contextual theme pool instead (not literally AI-generated). Retail/institutional sentiment scores are a deterministic simulation. See lib/sentimentEngine.js.`;
  } else if (hasSentimentDataApiKey) {
    note =
      "A SENTIMENT_DATA_API_KEY is configured, but no live sentiment/positioning data provider is wired up to it yet. Themes are rotated from a contextual theme pool (not literally AI-generated — no GEMINI_API_KEY or ANTHROPIC_API_KEY is configured), and retail/institutional sentiment scores are a deterministic simulation. See lib/sentimentEngine.js.";
  } else {
    note =
      "Simulated — no live sentiment/positioning data provider, GEMINI_API_KEY, or ANTHROPIC_API_KEY is configured yet. Themes are rotated hourly from a contextual theme pool per asset class (not a rigid fixed list, but also not literally AI-generated), and retail/institutional sentiment scores are a deterministic, seeded simulation, not a real measurement.";
  }

  // Four human-readable market-commentary posts (Gold, WTI, DXY,
  // Crypto) built from the per-asset data just computed above — see
  // generateMarketBlogs() for provider order and the fallback
  // guarantee. Never throws, but guarded anyway so one bad blog can't
  // take down the whole snapshot.
  let marketBlogs = [];
  try {
    marketBlogs = await generateMarketBlogs(assets);
  } catch {
    marketBlogs = [];
  }

  return {
    assets,
    usingAiThemes,
    usingGeminiThemes,
    usingClaudeThemes,
    marketBlogs,
    hourBucket,
    generatedAt: new Date().toISOString(),
    note,
  };
}
