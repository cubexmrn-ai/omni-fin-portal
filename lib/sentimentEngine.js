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
//      and a separate "institutional/central-bank bias" score, using the
//      exact same seeded-PRNG-by-date-hour-bucket technique as
//      lib/socialBuzz.js's simulateAsset() — these are explicitly labeled
//      as a deterministic simulation, not a real measurement, unless/
//      until a real data provider is wired up (checks for a
//      SENTIMENT_DATA_API_KEY-style env var using the same honest
//      "configured but not wired up yet" pattern as the rest of this
//      project). A `divergence` field flags when retail and
//      institutional positioning disagree.
//
// This module intentionally duplicates hashString()/mulberry32() from
// lib/socialBuzz.js rather than importing them, specifically so it has
// no dependency on anything else in this repo and can be copy-pasted
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
const GEMINI_MODEL = "gemini-2.0-flash"; // placeholder model string — swap once an exact model is pinned
const CLAUDE_MODEL = "claude-sonnet-4-5"; // placeholder model string — swap once an exact model is pinned
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ---------------------------------------------------------------------------
// Shared deterministic-simulation helpers — copied (not imported) from
// lib/socialBuzz.js so this module stays fully standalone. See the
// header comment above for why.
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
 * hour, same convention as lib/socialBuzz.js's currentHourBucket(). */
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_THEME_TIMEOUT_MS);
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildThemePrompt(asset) }] }],
        generationConfig: { maxOutputTokens: 400 },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API responded with ${res.status}`);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return parseThemeList(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
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
// Deterministic retail/institutional sentiment simulation — same
// seeded-PRNG-by-date-hour-bucket technique as lib/socialBuzz.js's
// simulateAsset(), but with a distinct seed prefix ("sentiment-engine|")
// so the two modules' numbers are never accidentally identical.
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

  return {
    assets,
    usingAiThemes,
    usingGeminiThemes,
    usingClaudeThemes,
    hourBucket,
    generatedAt: new Date().toISOString(),
    note,
  };
}
