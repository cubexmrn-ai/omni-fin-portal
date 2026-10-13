// lib/i18n/academyUrLatn.js
//
// Roman Urdu translations of the OmniFin Academy's curriculum METADATA
// only — level title/subtitle/description and lesson titles — keyed by
// the same ids as lib/academyData.js, consumed by AcademyHub.jsx and
// LessonViewer.jsx when language === "ur-Latn".
//
// SCOPE, deliberately: this covers the navigational/structural layer
// (what a level or lesson is CALLED), not the lesson body itself. The
// actual lesson content in lib/academyData.js — explanations, worked
// formulas, quizzes — is ~2,300 lines of substantive financial
// education. Machine-translating that much technical material in one
// pass, without a subject-matter review, risks introducing subtle
// errors into content that teaches people how to size trading
// positions and manage risk — the one place on this site where a
// translation mistake could cost someone real money. So lesson bodies
// stay in their single authoritative English version (same principle
// as the Privacy/Terms/Disclaimer pages — see components/LegalNoticeBanner.jsx),
// while the parts a learner uses to navigate and recognize topics are
// fully translated here.
//
// BRACKET CONVENTION: every core technical/trading term keeps its
// standard English form in brackets alongside the Roman Urdu phrase —
// e.g. "Pips & Lot Sizes (Pips & Lot Sizes)" — because that's how these
// terms are actually used in spoken/written Roman Urdu trading
// discussion (traders say "risk management" and "stop loss" even
// mid-Urdu-sentence), and because a learner who later reads English
// trading material, broker platforms, or this same site in English
// needs to recognize the exact term, not a translated paraphrase of it.

export const ACADEMY_LEVELS_UR_LATN = {
  rookie: {
    title: "Rookie",
    subtitle: "Paisay aur Dolat ki Bunyadain (Foundations of Money & Wealth)",
    description:
      "Yahan se shuru karen. Charts aur trades se pehlay, samjhein ke paisa asal mein kya hai, yeh waqt ke sath apni value kyun kho deta hai, aur banks kis tarah credit banate hain.",
  },
  apprentice: {
    title: "Apprentice",
    subtitle: "Market Mechanics (Market Mechanics) aur Charting",
    description:
      "Seekhen ke markets asal mein prices kaise quote karti hain aur trades kaise execute hoti hain — candlesticks, spreads, pips, lots, aur order types (Order Types).",
  },
  analyst: {
    title: "Analyst",
    subtitle: "Technical Precision (Technical Precision) aur Indicators",
    description:
      "Woh core toolkit seekhen jo chart analysts asal mein use karte hain: Support/Resistance zones, RSI, Moving Averages, Fibonacci Retracements, aur Gann basics.",
  },
  strategist: {
    title: "Strategist",
    subtitle: "Macro Fundamentals aur Market Sentiment (Market Sentiment)",
    description:
      "Chart se thora zoom out karen: central bank policy, economic calendar, aur crowd ka mood markets ko kaise move karta hai.",
  },
  "pro-trader": {
    title: "Pro Trader",
    subtitle: "Risk Management (Risk Management) aur Psychology",
    description:
      "Woh level jo asal mein long-term survivors ko blown accounts se alag karta hai: Position Sizing (Position Sizing), Risk-to-Reward discipline, journaling, aur emotional control.",
  },
};

export const ACADEMY_LESSONS_UR_LATN = {
  "inflation-reality": { title: "Inflation (Inflation) ki Haqeeqat" },
  "money-vs-fiat": { title: "Paisa vs. Fiat Currency (Fiat Currency)" },
  "fractional-reserve-banking": { title: "Fractional Reserve Banking (Fractional Reserve Banking)" },
  "gold-vs-paper-money": { title: "Gold vs. Paper Money (Paper Money)" },
  "candlestick-anatomy": { title: "Candlestick (Candlestick) ki Anatomy" },
  "bid-ask-spread": { title: "Bid/Ask Spreads (Bid/Ask Spreads)" },
  "pips-and-lot-sizes": { title: "Pips & Lot Sizes (Pips & Lot Sizes)" },
  "order-types": { title: "Order Types (Order Types): Market vs. Limit" },
  "support-resistance": { title: "Support & Resistance (Support & Resistance) Zones" },
  "rsi-indicator": { title: "RSI (Relative Strength Index)" },
  "moving-averages": { title: "Moving Averages (Moving Averages)" },
  "fibonacci-retracements": { title: "Fibonacci Retracements (Fibonacci Retracements)" },
  "gann-basics": { title: "Gann Time & Price (Gann Time & Price) Basics" },
  "central-bank-rates": { title: "Central Bank Interest Rates (Interest Rates)" },
  "nfp-and-news-trading": { title: "Non-Farm Payrolls (NFP) aur News Trading" },
  "market-sentiment": { title: "Market Sentiment (Market Sentiment) ki Tashreeh" },
  "position-sizing-math": { title: "Position Sizing (Position Sizing) ka Math" },
  "risk-to-reward-ratio": { title: "Risk-to-Reward Ratio (Risk-to-Reward Ratio)" },
  "trading-journal": { title: "Trading Journal (Trading Journal) Rakhna" },
  "fomo-and-greed": { title: "FOMO aur Greed (FOMO & Greed) Par Qabu" },
};

/** Returns the Roman Urdu level metadata, falling back to the English
 * original's title (levels always keep the English rank name, e.g.
 * "Rookie") if an id is somehow missing from the map above. */
export function getUrLatnLevel(levelId, fallbackLevel) {
  return (
    ACADEMY_LEVELS_UR_LATN[levelId] || {
      title: fallbackLevel?.title,
      subtitle: fallbackLevel?.subtitle,
      description: fallbackLevel?.description,
    }
  );
}

export function getUrLatnLesson(lessonId, fallbackLesson) {
  return ACADEMY_LESSONS_UR_LATN[lessonId] || { title: fallbackLesson?.title };
}
