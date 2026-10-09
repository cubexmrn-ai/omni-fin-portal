// lib/socialBuzz.js
//
// Backend for the AI News page's "Social Buzz Tracker" — a mock/
// simulated view of chatter intensity and sentiment split across
// X/Twitter and Reddit for a handful of major assets.
//
// IMPORTANT HONESTY NOTE: this project has NO social-media API
// integration wired up anywhere (no X/Twitter API, no Reddit API, no
// paid social-listening provider). Faking "live" numbers from nothing
// would be presenting fabricated data as real, so this module is
// explicit, in both its data shape and every byte of UI copy that
// renders it, that the numbers below are SIMULATED — a deterministic,
// seeded pseudo-random generator, not a measurement of anything
// actually said on any platform.
//
// Determinism matters here: the values are seeded from the asset code
// + the current UTC date-and-hour bucket, so they're stable for an
// hour (consistent across page loads/reloads within that window)
// rather than randomly jittering on every request, which would look
// like noise rather than even a plausible simulation.
//
// `usingLiveApi` is always false right now. The route below checks a
// `SOCIAL_API_KEY`-style env var using the same honest-fallback pattern
// as ANTHROPIC_API_KEY elsewhere in this project (see
// app/api/market-ai/route.js, lib/newsAggregator.js) — if/when a real
// social-listening provider is connected, this is the integration
// point, and `usingLiveApi` would flip to true. Until then, the UI's
// "Use live social API" toggle stays visibly present but disabled,
// with a tooltip explaining why — never silently pretending to be live.

const TRACKED_ASSETS = [
  { code: "Gold", label: "Gold (XAU)" },
  { code: "BTC", label: "Bitcoin (BTC)" },
  { code: "ETH", label: "Ethereum (ETH)" },
  { code: "USD", label: "US Dollar (DXY)" },
  { code: "S&P 500", label: "S&P 500" },
  { code: "Oil", label: "Crude Oil (WTI)" },
];

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

/** Current UTC date-hour bucket, e.g. "2026-10-10T14", so values are
 * stable within an hour and change hourly rather than per-request. */
function currentHourBucket() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(
    now.getUTCDate()
  ).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}`;
}

function simulateAsset(asset, hourBucket) {
  const seed = hashString(`${asset.code}|${hourBucket}`);
  const rand = mulberry32(seed);

  // Buzz intensity: 0-100 "chatter volume" score, deliberately not
  // tied to anything real — just a plausible-looking distribution.
  const buzzIntensity = Math.round(10 + rand() * 85);

  // Sentiment split across three buckets, summing to 100%.
  const raw = [rand(), rand(), rand()];
  const sum = raw[0] + raw[1] + raw[2];
  const bullishPct = Math.round((raw[0] / sum) * 100);
  const bearishPct = Math.round((raw[1] / sum) * 100);
  const neutralPct = Math.max(0, 100 - bullishPct - bearishPct);

  // Split the same buzz intensity across the two platforms, so the UI
  // can show a small per-platform breakdown too.
  const xShare = 0.35 + rand() * 0.3; // 35-65% on X/Twitter
  const platforms = {
    x: Math.round(buzzIntensity * xShare),
    reddit: Math.round(buzzIntensity * (1 - xShare)),
  };

  return {
    asset: asset.code,
    label: asset.label,
    buzzIntensity,
    sentiment: { bullishPct, bearishPct, neutralPct },
    platforms,
  };
}

/**
 * Builds the full simulated Social Buzz Tracker payload. Never throws
 * (pure, deterministic math — no network call), and always labels
 * itself simulated unless/until a real provider is wired in.
 */
export function getSocialBuzz() {
  const hourBucket = currentHourBucket();
  const assets = TRACKED_ASSETS.map((a) => simulateAsset(a, hourBucket));
  const hasSocialApiKey = Boolean(process.env.SOCIAL_API_KEY);

  return {
    assets,
    usingLiveApi: false, // Always false — see header comment; a configured
    // SOCIAL_API_KEY does not change this yet, it's just the integration
    // point this is left ready for (same pattern as ANTHROPIC_API_KEY).
    hourBucket,
    generatedAt: new Date().toISOString(),
    note: hasSocialApiKey
      ? "A SOCIAL_API_KEY is configured, but no live social-listening provider is wired up to it yet — showing simulated buzz data below. See lib/socialBuzz.js."
      : "Simulated — no social data provider (X/Twitter, Reddit, or a paid listening service) is connected yet. These numbers are a deterministic mock, refreshed hourly, not real chatter.",
  };
}

export { TRACKED_ASSETS };
