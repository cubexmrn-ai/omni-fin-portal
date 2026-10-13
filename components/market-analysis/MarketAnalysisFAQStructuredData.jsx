// components/market-analysis/MarketAnalysisFAQStructuredData.jsx
//
// FAQPage JSON-LD for /market-analysis, built from the exact same
// MARKET_ANALYSIS_FAQS array components/market-analysis/
// MarketAnalysisFAQSection.jsx renders into the visible accordion —
// see components/market-analysis/marketAnalysisFaqData.js's header
// comment for why these answers must stay accurate to
// lib/technicalAnalysis.js's documented honesty ceiling.

import { getSiteUrl } from "@/lib/siteUrl";
import { MARKET_ANALYSIS_FAQS } from "@/components/market-analysis/marketAnalysisFaqData";

export default function MarketAnalysisFAQStructuredData() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/market-analysis#faq`,
    mainEntity: MARKET_ANALYSIS_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
