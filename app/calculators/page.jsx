// app/calculators/page.jsx
//
// Trading & Universal Financial Calculators Hub — a server component
// shell (so it can export metadata) wrapping
// components/calculators/CalculatorsHub.jsx, the "use client" component
// that renders the category tabs and the calculator grid (same
// page/component split as app/learn/page.jsx + AcademyHub.jsx and
// app/ai-news/page.jsx + NewsFeed.jsx elsewhere in this project).

import CalculatorsHub from "@/components/calculators/CalculatorsHub";

export const metadata = {
  title: "Trading & Financial Calculators | OmniFin Portal",
  description:
    "Free calculators for traders and households: Position & Lot Size, Pip Value, Risk/Reward Ratio, Margin & Leverage, Inflation & Purchasing Power, Compound Interest / Wealth Growth, and Business Profit Margin & Markup.",
  keywords: [
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
