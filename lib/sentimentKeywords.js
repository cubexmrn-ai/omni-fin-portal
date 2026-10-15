// lib/sentimentKeywords.js
//
// Shared rule-based (NOT AI) keyword sentiment scan — extracted out of
// lib/newsAggregator.js's original computeSentiment() so the exact
// same deterministic classification (count Bullish vs. Bearish keyword
// hits in a title+body string, defaulting to Neutral) can be reused
// anywhere a quick directional read is needed, without a second,
// independently-drifting copy of the word lists.
//
// Currently used by:
//   - lib/newsAggregator.js (news headline sentiment badges — the
//     original caller, now importing from here instead of keeping its
//     own local copy)
//   - components/market-analysis/AutomatedVideoInsights.jsx (the
//     compact video card's Bullish/Bearish tag pill, scanning the
//     generated post's own headline + body text since those posts have
//     no separate numeric sentiment score to read instead)
//
// Honesty note: this is a plain substring keyword count, identical in
// spirit to lib/newsAggregator.js's pre-existing approach — it is never
// presented as AI-generated or as a trading signal.

export const BULLISH_WORDS = [
  "surge", "surges", "surged", "rally", "rallies", "rallied", "soar", "soars", "soared",
  "jump", "jumps", "jumped", "gain", "gains", "gained", "climb", "climbs", "climbed",
  "rise", "rises", "rising", "rose", "record high", "all-time high", "bullish",
  "upgrade", "upgraded", "beat", "beats", "beating", "outperform", "optimis",
  "rebound", "rebounds", "rally", "strengthen", "strengthens", "strengthened",
  "boost", "boosts", "boosted", "recover", "recovers", "recovery",
];

export const BEARISH_WORDS = [
  "plunge", "plunges", "plunged", "slump", "slumps", "slumped", "crash", "crashes", "crashed",
  "fall", "falls", "fell", "falling", "drop", "drops", "dropped", "decline", "declines", "declined",
  "sink", "sinks", "sank", "tumble", "tumbles", "tumbled", "bearish", "downgrade", "downgraded",
  "miss", "misses", "missing", "underperform", "pessimis", "slide", "slides", "slid",
  "weaken", "weakens", "weakened", "sell-off", "selloff", "losses", "loss", "recession",
  "warn", "warns", "warning", "concern", "concerns", "risk", "risks", "fear", "fears",
];

export function computeKeywordSentiment(title, excerpt) {
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
