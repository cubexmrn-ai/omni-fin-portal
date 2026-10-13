// components/market-analysis/MarketAnalysisFAQSection.jsx
//
// Visible FAQ section for /market-analysis — renders
// MARKET_ANALYSIS_FAQS (components/market-analysis/
// marketAnalysisFaqData.js) through the shared
// components/FAQAccordion.jsx UI. Rendered directly from
// app/market-analysis/page.jsx, below MarketOverviewBoard.

import FAQAccordion from "@/components/FAQAccordion";
import { MARKET_ANALYSIS_FAQS } from "@/components/market-analysis/marketAnalysisFaqData";

export default function MarketAnalysisFAQSection() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <FAQAccordion
        title="Market Analysis Guide & FAQs"
        subtitle="What's live, how the technical analysis report is built, and its honest limitations."
        items={MARKET_ANALYSIS_FAQS}
      />
    </div>
  );
}
