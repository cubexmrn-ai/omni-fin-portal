// components/converters/ZakatGoldStructuredData.jsx
//
// JSON-LD for a "zakat-on-<N>-tola-gold" pSEO page (e.g.
// /converters/zakat-on-10-tola-gold) — a FinancialProduct describing
// this specific gold-amount zakat reference, a WebApplication for the
// underlying calculator tool, and a FAQPage built from the same
// `faqs` array the page renders into its visible <FAQAccordion/>, same
// pairing convention as AmountConverterStructuredData.jsx and
// ConvertersFAQStructuredData.jsx.
//
// Honesty note (same bar as every other structured-data file in this
// project, and the same bar lib/zakatCalculator.js's own header
// comment sets): nisab/zakat figures here are a general reference, not
// a religious ruling, and every monetary figure is only included when
// a genuinely live gold rate was resolved server-side — never a
// fabricated or stale-looking number standing in for one that failed
// to load.
export default function ZakatGoldStructuredData({
  tolaAmount,
  grams,
  zakatResult,
  pageUrl,
  siteUrl,
  faqs,
}) {
  const hasResult = Boolean(zakatResult);

  const financialProduct = {
    "@type": "FinancialProduct",
    name: `Zakat on ${tolaAmount} Tola Gold`,
    description: `Zakat reference for ${tolaAmount} tola (${grams.toFixed(2)}g) of gold, checked against the live nisab threshold.`,
    category: "Zakat Calculator",
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "OmniFin Portal",
      url: siteUrl,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "tolaAmount", value: tolaAmount },
      { "@type": "PropertyValue", name: "gramsEquivalent", value: grams },
      ...(hasResult
        ? [
            { "@type": "PropertyValue", name: "goldValue", value: zakatResult.goldValue },
            { "@type": "PropertyValue", name: "nisabThresholdValue", value: zakatResult.nisabThresholdValue },
            { "@type": "PropertyValue", name: "meetsNisab", value: zakatResult.meetsNisab },
            { "@type": "PropertyValue", name: "zakatDue", value: zakatResult.zakatDue },
            { "@type": "PropertyValue", name: "ratePercent", value: zakatResult.ratePercent },
          ]
        : []),
    ],
  };

  const webApplication = {
    "@type": "WebApplication",
    name: "OmniFin Portal Zakat Calculator",
    url: pageUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqPage =
    faqs && faqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [financialProduct, webApplication, ...(faqPage ? [faqPage] : [])],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
