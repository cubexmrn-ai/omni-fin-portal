// lib/socialBuzz.js
//
// Backend for the AI News page's "Social Buzz Tracker".
//
// Live path (when REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET are both
// configured): real hot-post engagement + rule-based sentiment per
// asset, pulled straight from Reddit's public API (app-only OAuth2,
// "client_credentials" grant — no user login involved, no X/Twitter
// integration exists anywhere in this project). Sentiment reuses
// lib/sentimentKeywords.js's computeKeywordSentiment() — the SAME
// rule-based keyword scan already used for news headlines elsewhere on
// the site, not a second, independently-invented classifier.
//
// Fallback path (missing credentials, or Reddit unreachable for a given
// subreddit): the original deterministic, seeded simulation, completely
// unchanged and still labeled as such — this project never fabricates
// "live" numbers when a real provider isn't actually reachable.
// Falls back PER ASSET, not all-or-nothing: one subreddit having a bad
// moment doesn't drag the other five back into simulation with it.
//
// IMPORTANT HONESTY NOTE ON SCOPE: there is still no X/Twitter
// integration here (X's API has no free tier), so `platforms.x` is
// `null` (rendered as "—", never a fabricated 0) for every live asset —
// only the Reddit side of "Buzz" is ever real. The simulated fallback
// keeps its original X+Reddit split so it still reads as a plausible
// mock when shown.

const TRACKED_ASSETS = [
  { code: "Gold", label: "Gold (XAU)" },
  { code: "BTC", label: "Bitcoin (BTC)" },
  { code: "ETH", label: "Ethereum (ETH)" },
  { code: "USD", label: "US Dollar (DXY)" },
  { code: "S&P 500", label: "S&P 500" },
  { code: "Oil", label: "Crude Oil (WTI)" },
];

// Deliberately ONE subreddit per asset, not a blended pool of "finance"
// subreddits — folding r/CryptoCurrency's chatter into Gold's score (or
// vice versa) would misattribute one asset's sentiment onto another.
// DXY and S&P 500 are necessarily index-level proxies here (neither has
// its own single-ticker subreddit the way Bitcoin or gold do) — r/Forex
// and r/stocks are the closest real communities that actually discuss
// those, which is disclosed in the UI rather than hidden.
const ASSET_SUBREDDITS = {
  Gold: "Gold",
  BTC: "Bitcoin",
  ETH: "ethereum",
  USD: "Forex",
  "S&P 500": "stocks",
  Oil: "energy",
};

const REDDIT_USER_AGENT = "web:omnifinportal-social-buzz:v1.0 (by /u/omnifinportal)";
const REDDIT_FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Reddit's app-only tokens last ~1 hour; cached in module scope so a
// warm serverless invocation doesn't re-authenticate on every request.
// Harmless, not load-bearing, if a cold start resets it.
let cachedToken = null; // { value, expiresAt }

async function getRedditAccessToken(clientId, clientSecret) {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetchWithTimeout("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": REDDIT_USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new Error(`Reddit auth: ${data?.error || `HTTP ${res.status}`}`);
  }
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(0, (data.expires_in || 3600) - 60) * 1000,
  };
  return cachedToken.value;
}

async function fetchSubredditHot(subreddit, token) {
  const res = await fetchWithTimeout(`https://oauth.reddit.com/r/${subreddit}/hot?limit=25`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": REDDIT_USER_AGENT,
    },
  });
  const data = await res.json().catch(() => null);
  const posts = data?.data?.children;
  if (!res.ok || !Array.isArray(posts)) {
    throw new Error(`r/${subreddit} responded ${res.status}`);
  }
  return posts.map((p) => p?.data).filter(Boolean);
}

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

/** Current UTC date-hour bucket, e.g. "2026-10-10T14", so SIMULATED
 * values are stable within an hour and change hourly rather than
 * per-request. (Live values have no bucket — they're read fresh from
 * Reddit's current hot listing every call, subject only to the route's
 * own HTTP cache headers.) */
function currentHourBucket() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(
    now.getUTCDate()
  ).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}`;
}

function simulateAsset(asset, hourBucket) {
  const seed = hashString(`${asset.code}|${hourBucket}`);
  const rand = mulberry32(seed);

  const buzzIntensity = Math.round(10 + rand() * 85);

  const raw = [rand(), rand(), rand()];
  const sum = raw[0] + raw[1] + raw[2];
  const bullishPct = Math.round((raw[0] / sum) * 100);
  const bearishPct = Math.round((raw[1] / sum) * 100);
  const neutralPct = Math.max(0, 100 - bullishPct - bearishPct);

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
    source: "simulated",
    subreddit: ASSET_SUBREDDITS[asset.code] || null,
  };
}

/**
 * Turns a subreddit's real hot-post listing into the same shape as
 * simulateAsset() returns, but with every number actually derived from
 * Reddit's response: sentiment is the Bullish/Bearish/Neutral keyword
 * verdict (computeKeywordSentiment, imported below) counted across the
 * fetched posts' titles+selftext, and buzzIntensity is a log-scaled read
 * on total score+comment engagement (log-scaled so one viral post can't
 * single-handedly pin every asset at 100 — hot-post engagement commonly
 * spans several orders of magnitude).
 */
function buildLiveAsset(asset, posts, computeKeywordSentiment) {
  let bullish = 0;
  let bearish = 0;
  let totalEngagement = 0;

  for (const post of posts) {
    const verdict = computeKeywordSentiment(post.title, post.selftext);
    if (verdict === "Bullish") bullish += 1;
    else if (verdict === "Bearish") bearish += 1;
    totalEngagement += Math.max(0, post.score || 0) + Math.max(0, post.num_comments || 0);
  }

  const totalPosts = posts.length || 1;
  const bullishPct = Math.round((bullish / totalPosts) * 100);
  const bearishPct = Math.round((bearish / totalPosts) * 100);
  const neutralPct = Math.max(0, 100 - bullishPct - bearishPct);
  const buzzIntensity = Math.min(100, Math.round(Math.log10(totalEngagement + 1) * 24));

  return {
    asset: asset.code,
    label: asset.label,
    buzzIntensity,
    sentiment: { bullishPct, bearishPct, neutralPct },
    // No X/Twitter integration exists — `x: null` renders as "—" in the
    // UI, never a fabricated 0. `reddit` reuses the same buzzIntensity
    // since Reddit IS the entire live signal here.
    platforms: { x: null, reddit: buzzIntensity },
    source: "reddit",
    subreddit: ASSET_SUBREDDITS[asset.code],
    postsSampled: posts.length,
  };
}

/**
 * Builds the full Social Buzz Tracker payload. Tries real Reddit data
 * per asset when REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET are configured,
 * falling back to the deterministic simulation for any asset whose
 * subreddit fetch fails (or for every asset if the credentials are
 * missing or the auth call itself fails). Never throws.
 */
export async function getSocialBuzz() {
  const hourBucket = currentHourBucket();
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      assets: TRACKED_ASSETS.map((a) => simulateAsset(a, hourBucket)),
      usingLiveApi: false,
      liveCount: 0,
      totalCount: TRACKED_ASSETS.length,
      hourBucket,
      generatedAt: new Date().toISOString(),
      note: "Simulated — no Reddit API credentials (REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET) are configured yet. These numbers are a deterministic mock, refreshed hourly, not real chatter.",
    };
  }

  // Dynamic import avoids a hard module-load-order dependency between
  // this file and lib/sentimentKeywords.js — both are plain, small
  // modules either order works fine, but this keeps the import local to
  // the one function that actually needs it.
  const { computeKeywordSentiment } = await import("@/lib/sentimentKeywords");

  let token = null;
  let authError = null;
  try {
    token = await getRedditAccessToken(clientId, clientSecret);
  } catch (err) {
    authError = err.message || "unknown error";
  }

  const settled = await Promise.all(
    TRACKED_ASSETS.map(async (asset) => {
      if (!token) {
        return { asset, live: null, error: authError };
      }
      try {
        const posts = await fetchSubredditHot(ASSET_SUBREDDITS[asset.code], token);
        if (posts.length === 0) throw new Error("no posts returned");
        return { asset, live: buildLiveAsset(asset, posts, computeKeywordSentiment), error: null };
      } catch (err) {
        return { asset, live: null, error: err.message || "unknown error" };
      }
    })
  );

  const assets = settled.map(({ asset, live }) => live || simulateAsset(asset, hourBucket));
  const liveCount = settled.filter((r) => r.live).length;
  const failures = settled.filter((r) => !r.live && r.error).map((r) => `${r.asset.code}: ${r.error}`);

  let note;
  if (liveCount === TRACKED_ASSETS.length) {
    note = "Live — buzz intensity and sentiment are derived from each asset's real Reddit hot-post listing (see lib/socialBuzz.js for the per-asset subreddit mapping). No X/Twitter integration exists, so the X column is left blank rather than shown as zero.";
  } else if (liveCount > 0) {
    note = `Partially live — ${liveCount} of ${TRACKED_ASSETS.length} assets pulled real Reddit data; the rest fell back to the simulated mock (${failures.join("; ") || "reason unavailable"}).`;
  } else {
    note = `Simulated — Reddit credentials are configured, but no asset's subreddit could be reached right now (${
      authError || failures[0] || "unknown error"
    }); showing the deterministic mock instead.`;
  }

  return {
    assets,
    usingLiveApi: liveCount > 0,
    liveCount,
    totalCount: TRACKED_ASSETS.length,
    hourBucket,
    generatedAt: new Date().toISOString(),
    note,
  };
}

export { TRACKED_ASSETS, ASSET_SUBREDDITS };
