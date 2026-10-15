// components/calculators/CalculatorsStructuredData.jsx
//
// JSON-LD for /calculators, rendered from app/calculators/layout.jsx
// (a Server Component) rather than app/calculators/page.jsx itself —
// that page is intentionally a fully self-contained "use client" file
// with zero child imports (see its own header comment), so structured
// data for it has to live in its layout sibling instead, the same way
// that route's <title>/description metadata does.
//
// Two entities, same "@graph" pattern as components/SiteStructuredData
// and components/ConverterStructuredData:
//   - SoftwareApplication: the Trading Calculator Suite itself, as one
//     free tool with 5 modes (listed in `featureList`, mirroring the
//     MODES array app/calculators/page.jsx actually renders).
//   - FAQPage: the 5 Q&A pairs from that page's own "Calculator Guide
//     & Knowledge Notes" accordion (see its CalculationGuide
//     function), phrased as questions for schema purposes but with
//     answer text matching the visible accordion copy — Google's
//     FAQPage guidance requires the structured answer to match what a
//     visitor actually sees on the page, so nothing here is invented
//     beyond rephrasing an accordion's title as a question.
//
// Honesty note (same bar as every other structured-data file in this
// project): no aggregateRating/review fields, and the SoftwareApplication's
// Offer is genuinely $0 — every calculator on this page is free, no
// paid tier exists.

import { getSiteUrl } from "@/lib/siteUrl";

// Kept in sync by hand with app/calculators/page.jsx's CalculationGuide
// accordion — if that accordion's copy changes, update the matching
// `answer` string here so the schema never claims content the page
// doesn't actually show.
const CALCULATOR_FAQS = [
  {
    question: "What is a pip and what is it worth?",
    answer:
      "A pip (or point/tick for indices and crypto) is the smallest standard price increment for an instrument — 0.0001 for most forex pairs, 0.01 for JPY/PKR pairs and metals/energy on some brokers. Pip value in your account currency = pip size × contract size (units per lot) × your lot size, converted from the quote currency to USD and then to your selected Account / Local Currency using the current exchange rate.",
  },
  {
    question: "What is the lot sizing formula for position size?",
    answer:
      "Position size is solved backward from how much you're willing to lose: Risk Amount = Account Balance × Risk %. Standard Lots = Risk Amount ÷ (Stop-Loss Pips × Pip Value per Standard Lot). Mini lots are 10× that figure and micro lots 100×, since a standard lot is 100,000 base-currency units (10,000 mini, 1,000 micro).",
  },
  {
    question: "What is the 1–2% account risk rule?",
    answer:
      "Most professional risk-management guidance caps the amount risked on any single trade at 1–2% of total account balance, so a string of losses doesn't cause lasting damage — e.g. on a $10,000 account, a 1% risk rule caps a single trade's potential loss at $100.",
  },
  {
    question: "How are Risk:Reward ratio and required margin calculated?",
    answer:
      "Risk:Reward compares potential reward to potential risk in dollar terms (e.g. 1:2 means you stand to make twice what you're risking). Required Margin is the position's notional value divided by your leverage ratio; Free Margin is what's left of your balance after that margin is set aside — a negative free margin means the position is too large for your account at that leverage.",
  },
  {
    question: "How do inflation and compound growth calculations work?",
    answer:
      "Inflation math projects a nominal amount forward at a compounding annual rate to show what today's money will need to grow to just to keep its buying power. Compound growth does the reverse — projecting a starting balance plus regular monthly contributions forward at a compounding annual return. Both are long-horizon estimates, not guarantees.",
  },
];

export default function CalculatorsStructuredData() {
  const siteUrl = getSiteUrl();

  const softwareApplication = {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/calculators#webapp`,
    name: "OmniFin Trading Calculator Suite",
    url: `${siteUrl}/calculators`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any (web-based)",
    description:
      "A free, unified trading and personal-finance calculator suite: All-in-One Trade Execution (profit/loss, risk:reward, pip value, margin), Position & Lot Size, Pip Value & Custom Math, Margin & Leverage, and Wealth & Personal Finance (inflation, compound growth, profit margin, rental yield & mortgage amortization, tax & fee estimates) — synced to live market rates.",
    featureList: [
      "All-in-One Trade Execution Suite",
      "Position & Lot Size Calculator",
      "Pip Value Calculator",
      "Margin & Leverage Calculator",
      "Inflation & Purchasing Power Calculator",
      "Compound Interest / Wealth Growth Calculator",
      "Business Profit Margin & Markup Calculator",
      "Rental Yield & Mortgage Calculator",
      "Tax & Fee Estimator",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${siteUrl}/calculators#faq`,
    mainEntity: CALCULATOR_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [softwareApplication, faqPage],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
