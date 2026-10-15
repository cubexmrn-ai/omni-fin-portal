// lib/topicTags.js
//
// Shared rule-based (NOT AI) asset-class topic classifier. Neither the
// YouTube video posts (lib/youtubeAutomation.js) nor the news headlines
// (lib/newsAggregator.js) carry a genuine Forex/Crypto/Metals/Macro
// label — video posts are only tagged by destination PAGE
// ("market-analysis" | "ai-news", see config/trackedChannels.json), and
// news items are tagged by a broader RSS-feed category ("Stocks",
// "Forex", "Crypto", "Commodities", see lib/newsAggregator.js). This
// module derives the 4-bucket topic the redesigned /ai-news category
// tabs use (All / Forex / Crypto / Metals & Commodities / Macro) from
// whatever text or category IS available, with a plain keyword scan —
// the same deterministic, no-AI approach as
// lib/sentimentKeywords.js's computeKeywordSentiment(), not a claim of
// precise classification.

export const MASTER_TOPICS = ["Forex", "Crypto", "Metals & Commodities", "Macro"];

const TOPIC_KEYWORDS = [
  {
    topic: "Metals & Commodities",
    words: [
      "gold", "silver", "platinum", "palladium", "xau", "xag", "xpt", "xpd",
      "copper", "oil", "wti", "crude", "commodit", "bullion", "ounce",
    ],
  },
  {
    topic: "Crypto",
    words: [
      "bitcoin", "btc", "ethereum", "eth", "crypto", "altcoin", "solana",
      "blockchain", "token", "stablecoin", "binance", "coinbase",
    ],
  },
  {
    topic: "Forex",
    words: [
      "eur/usd", "eur usd", "gbp", "usd/jpy", "usdjpy", "forex", "fx ",
      "dollar index", "dxy", "currency pair", "yen", "euro", "pound",
    ],
  },
  {
    topic: "Macro",
    words: [
      "fed", "fomc", "cpi", "inflation", "rate cut", "rate hike", "jobs report",
      "nonfarm", "gdp", "economy", "powell", "recession", "interest rate",
      "central bank", "treasury",
    ],
  },
];

/**
 * Classifies free text (a video post's title/body, a headline/excerpt)
 * into one of MASTER_TOPICS. First keyword bucket with a hit wins, in
 * the fixed TOPIC_KEYWORDS order above; "Macro" is the default bucket
 * for general market commentary that doesn't name a specific asset
 * class, since that's the closest real-world fit for an unclassified
 * markets/finance piece.
 */
export function classifyTopic(text) {
  const haystack = (text || "").toLowerCase();
  for (const { topic, words } of TOPIC_KEYWORDS) {
    if (words.some((word) => haystack.includes(word))) return topic;
  }
  return "Macro";
}

// Maps lib/newsAggregator.js's existing RSS-feed categories onto the
// same 4-bucket topic set, so /ai-news's unified category tabs can
// filter news headlines and AI video posts with one control. "Stocks"
// has no equivalent in MASTER_TOPICS — general equities/indices
// commentary is grouped under "Macro" as the closest real-world fit,
// same default used by classifyTopic() above.
const NEWS_CATEGORY_TO_TOPIC = {
  Forex: "Forex",
  Crypto: "Crypto",
  Commodities: "Metals & Commodities",
  Stocks: "Macro",
};

export function topicForNewsItem(item) {
  return NEWS_CATEGORY_TO_TOPIC[item?.category] || classifyTopic(`${item?.title} ${item?.excerpt}`);
}

export function topicForVideoPost(post) {
  return classifyTopic(`${post?.title} ${post?.body}`);
}
