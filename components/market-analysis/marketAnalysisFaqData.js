// components/market-analysis/marketAnalysisFaqData.js
//
// Single source of truth for /market-analysis' visible FAQ accordion
// (components/market-analysis/MarketAnalysisFAQSection.jsx) and its
// FAQPage JSON-LD (components/market-analysis/
// MarketAnalysisFAQStructuredData.jsx).
//
// Every claim below is grounded in lib/technicalAnalysis.js's own
// header comment — this project's documented "honesty ceiling" for
// what the on-demand Technical Analysis report can and can't
// genuinely compute (no historical price series is stored anywhere,
// only the current live spot price). The RSI/Gann answer in
// particular must stay accurate to that: those sections are shown on
// the page, but explicitly marked unavailable with a reason, never
// presented as a real reading. Rewriting these answers to claim RSI,
// EMA/SMA or Gann Theory are "calculated" would misrepresent what the
// code actually does.

export const MARKET_ANALYSIS_FAQS = [
  {
    question: "What live market data is shown on this page?",
    answer:
      "A top ticker strip with S&P 500, Nasdaq 100, Gold, BTC/USD and EUR/USD, a full interactive TradingView chart for any symbol you choose, and an on-demand technical analysis report — all free, with no account or login required.",
  },
  {
    question: "How is the Technical Analysis report generated?",
    answer:
      "It's a rule-based engine, not a model trained on historical charts: Price Action, Support & Resistance and Pivot Points are computed from the current live spot price using real floor-trader pivot formulas and round psychological price levels. Fibonacci Retracement applies the real ratio math (23.6% / 38.2% / 50% / 61.8% / 78.6%) to an explicitly labeled illustrative price band, since a genuine retracement needs a detected historical swing high/low that isn't available here.",
  },
  {
    question: "Does the report include RSI, moving averages, or Gann Theory?",
    answer:
      "Those sections appear in the report but are explicitly marked unavailable, with the reason stated: RSI, EMA/SMA and Gann Theory all require a historical price sequence, and this platform only has access to the current live spot price, not a price history. Rather than invent a number, the report says exactly why and what would be needed to unlock the real calculation.",
  },
  {
    question: "Is the Fundamental or Overall Bias a complete fundamental analysis?",
    answer:
      "No — it's explicitly labeled a simplified macro linkage, not comprehensive fundamental analysis: USD strength (itself derived from live EUR/USD, GBP/USD and AUD/USD positioning) is used to infer a directional bias for USD-denominated assets. The Overall Market Sentiment is a deterministic blend of this and the Technical Bias, with a note on whether the two agree or conflict.",
  },
  {
    question: "Is Market Analysis free to use?",
    answer:
      "Yes — the live ticker, the full TradingView chart, and the on-demand technical analysis report are all free, with no login required.",
  },
];
