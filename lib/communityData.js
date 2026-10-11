// lib/communityData.js
//
// Pure data + helpers for the Community Forum & Trade Setups Hub
// (app/community/page.jsx). Seeded, illustrative discussion posts —
// NOT real user activity or real trading performance — so every
// place this data reaches the UI is labeled accordingly (see
// components/community/CommunityHub.jsx's "demo community" note),
// the same honesty discipline already used elsewhere in this project
// (the Social Buzz Tracker's persistent "Simulated" badge, the
// Market Analysis page's explicit "illustrative, not a real detected
// swing" labels on Fibonacci/Pivot Points).
//
// No React, no browser APIs — safe to import from a Server Component.

export const CATEGORIES = [
  { id: "all", label: "All Discussions" },
  { id: "setups", label: "Trade Setups & Ideas" },
  { id: "macro", label: "Macro & News Speculation" },
  { id: "literacy", label: "Financial Literacy" },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

export const ASSET_TAGS = [
  { id: "gold", label: "Gold", hashtag: "#Gold" },
  { id: "forex", label: "Forex", hashtag: "#Forex" },
  { id: "crypto", label: "Crypto", hashtag: "#Crypto" },
  { id: "indices", label: "Indices", hashtag: "#Indices" },
];

export function getAssetTag(id) {
  return ASSET_TAGS.find((a) => a.id === id) || null;
}

export const BIAS_OPTIONS = [
  { id: "long", label: "Long / Bullish" },
  { id: "short", label: "Short / Bearish" },
  { id: "none", label: "No direction (discussion only)" },
];

// ---------------------------------------------------------------------------
// Seed posts — illustrative only. `baseUpvotes`/`baseDownvotes`/
// `baseBullseyeCount` are the seeded starting counts; a viewer's own
// vote/Bullseye-tag is tracked separately, client-side, by
// hooks/useCommunityPosts.js and added on top of these at render time
// — see that file's header comment for why it's structured that way
// (so a single browser's vote is never double-counted across visits).
// ---------------------------------------------------------------------------
export const SEED_POSTS = [
  {
    id: "seed-1",
    authorHandle: "@goldpip_asif",
    category: "setups",
    assetTags: ["gold"],
    title: "XAU/USD reclaiming the 2,640 shelf — long bias into NFP",
    body: "Gold swept the Asia-session low and is reclaiming the 2,640 shelf that's held three times this month. Watching for a clean close above 2,655 before adding — this is a reaction to the shelf, not a confirmed breakout yet.",
    bias: "long",
    entry: 2652,
    stopLoss: 2634,
    takeProfit: 2698,
    createdAt: "2026-10-09T06:12:00.000Z",
    baseUpvotes: 41,
    baseDownvotes: 6,
    baseBullseyeCount: 9,
    isUserSubmitted: false,
  },
  {
    id: "seed-2",
    authorHandle: "@fx_marnie",
    category: "setups",
    assetTags: ["forex"],
    title: "EUR/USD short on the failed retest of the weekly trendline",
    body: "Price tagged the descending weekly trendline for a third time and is already rejecting. Stop sits just above the wick high — if this breaks and holds above instead, the whole short thesis is invalid.",
    bias: "short",
    entry: 1.0912,
    stopLoss: 1.0948,
    takeProfit: 1.082,
    createdAt: "2026-10-09T09:40:00.000Z",
    baseUpvotes: 23,
    baseDownvotes: 11,
    baseBullseyeCount: 4,
    isUserSubmitted: false,
  },
  {
    id: "seed-3",
    authorHandle: "@satoshi_sana",
    category: "setups",
    assetTags: ["crypto"],
    title: "BTC/USD range compression under 68k — watching for the break",
    body: "Volatility has been compressing for five sessions in a tight range. No position yet — this is a 'watchlist' post, not a live setup — but a daily close outside either edge with volume is what I'd act on.",
    bias: "none",
    entry: null,
    stopLoss: null,
    takeProfit: null,
    createdAt: "2026-10-08T14:05:00.000Z",
    baseUpvotes: 17,
    baseDownvotes: 2,
    baseBullseyeCount: 3,
    isUserSubmitted: false,
  },
  {
    id: "seed-4",
    authorHandle: "@indextrader_leo",
    category: "setups",
    assetTags: ["indices"],
    title: "NAS100 pullback to the rising 4H trendline — long continuation",
    body: "Nasdaq pulled back exactly into the rising 4H trendline + prior breakout shelf confluence. Sizing small given this is still inside an extended move — treating this as a continuation trade, not a fresh breakout.",
    bias: "long",
    entry: 19850,
    stopLoss: 19640,
    takeProfit: 20300,
    createdAt: "2026-10-09T11:22:00.000Z",
    baseUpvotes: 29,
    baseDownvotes: 5,
    baseBullseyeCount: 7,
    isUserSubmitted: false,
  },
  {
    id: "seed-5",
    authorHandle: "@macro_hana",
    category: "macro",
    assetTags: ["forex", "gold"],
    title: "What a soft NFP print would actually do to DXY (and gold)",
    body: "Speculation thread, not a trade call: if payrolls miss meaningfully, the base case is a dovish repricing of the rate path, which is generally USD-negative and gold-positive — but a miss paired with a hot wage number could flip that read. Curious how others are positioning around the release itself versus waiting for it to print.",
    bias: "none",
    entry: null,
    stopLoss: null,
    takeProfit: null,
    createdAt: "2026-10-07T17:30:00.000Z",
    baseUpvotes: 34,
    baseDownvotes: 3,
    baseBullseyeCount: 0,
    isUserSubmitted: false,
  },
  {
    id: "seed-6",
    authorHandle: "@centralbank_watcher",
    category: "macro",
    assetTags: ["forex"],
    title: "Reading the last central bank statement's language shift",
    body: "The change from 'will act as necessary' to 'stands ready to act' in the last statement is a small wording shift, but it's the kind of thing that's moved markets before. Not predicting a specific move here — just flagging it as worth watching into the next meeting.",
    bias: "none",
    entry: null,
    stopLoss: null,
    takeProfit: null,
    createdAt: "2026-10-06T08:15:00.000Z",
    baseUpvotes: 19,
    baseDownvotes: 1,
    baseBullseyeCount: 0,
    isUserSubmitted: false,
  },
  {
    id: "seed-7",
    authorHandle: "@riskfirst_dana",
    category: "literacy",
    assetTags: [],
    title: "The 1% rule saved my account this year — here's the math",
    body: "I used to size trades by 'gut feel' and blew up two accounts doing it. Switching to a strict 1% risk-per-trade rule (Account Balance x 1% / Stop Distance = position size) means a 5-loss streak costs about 5%, not 50%. Boring, but it's the only thing that's actually worked.",
    bias: "none",
    entry: null,
    stopLoss: null,
    takeProfit: null,
    createdAt: "2026-10-05T12:00:00.000Z",
    baseUpvotes: 52,
    baseDownvotes: 2,
    baseBullseyeCount: 0,
    isUserSubmitted: false,
  },
  {
    id: "seed-8",
    authorHandle: "@journaling_imran",
    category: "literacy",
    assetTags: [],
    title: "Six months of journaling every trade — the patterns surprised me",
    body: "I wasn't losing because of bad setups. I was losing because I closed winners early out of fear and let losers run out of hope — the exact opposite of what every risk-management post says to do. Only found that pattern because it was all written down.",
    bias: "none",
    entry: null,
    stopLoss: null,
    takeProfit: null,
    createdAt: "2026-10-04T19:45:00.000Z",
    baseUpvotes: 38,
    baseDownvotes: 4,
    baseBullseyeCount: 0,
    isUserSubmitted: false,
  },
  {
    id: "seed-9",
    authorHandle: "@silverstacker_q",
    category: "setups",
    assetTags: ["gold"],
    title: "XAG/USD coiling under resistance — long if it clears 31.80",
    body: "Silver's been compressing under the 31.80 shelf for a week. No position yet — waiting for a confirmed close above before entering, since this level has rejected price twice already this month.",
    bias: "long",
    entry: 31.85,
    stopLoss: 30.9,
    takeProfit: 33.4,
    createdAt: "2026-10-08T21:10:00.000Z",
    baseUpvotes: 15,
    baseDownvotes: 3,
    baseBullseyeCount: 2,
    isUserSubmitted: false,
  },
];

export function getAllPosts() {
  return SEED_POSTS;
}
