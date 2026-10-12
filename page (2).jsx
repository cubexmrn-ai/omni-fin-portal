// app/calculators/page.jsx
//
// Trading Calculator Suite — a server component shell (so it can
// export metadata) wrapping components/calculators/CalculatorsHub.jsx,
// the "use client" component that renders the unified Suite (same
// page/component split as app/learn/page.jsx + AcademyHub.jsx and
// app/ai-news/page.jsx + NewsFeed.jsx elsewhere in this project).
//
// The page itself is now just this one Suite — components/calculators/
// TradingTerminal.jsx — covering 5 modes (All-in-One Trade Execution,
// Position Sizing & Lot, Pip Value, Margin & Leverage, Inflation &
// Wealth Growth) via a single Selector Bar, plus a standalone Business
// Profit Margin & Markup card beneath it.

import CalculatorsHub from "@/components/calculators/CalculatorsHub";

export const metadata = {
  title: "Trading Calculator Suite | OmniFin Portal",
  description:
    "A unified Trading Calculator Suite for traders and households: All-in-One Trade Execution (profit/loss, R:R, pip value, margin in one pass), Position Sizing & Lot, Pip Value, Margin & Leverage, Inflation & Wealth Growth, and Business Profit Margin & Markup.",
  keywords: [
    "trading calculator suite",
    "all-in-one trade calculator",
    "lot size calculator",
    "pip value calculator",
    "risk reward ratio calculator",
    "margin calculator",
    "leverage calculator",
    "inflation calculator",
    "compound interest calculator",
    "profit margin calculator",
    "markup calculator",
    "forex position size calculator",
  ],
};

export default function CalculatorsPage() {
  return <CalculatorsHub />;
}
