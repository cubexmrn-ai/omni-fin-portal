// components/converters/AmountConverterStructuredData.jsx
//
// JSON-LD for an amount-specific pSEO converter page (e.g.
// /converters/2000-aed-to-pkr) — a FinancialProduct carrying a nested
// ExchangeRateSpecification (the schema.org type built exactly for
// this: a currency pair's current rate), a WebApplication describing
// the converter tool itself, and a FAQPage built from the same `faqs`
// array the page renders into its visible <FAQAccordion/> — so the
// structured data can never say anything the page itself doesn't also
// show, same pairing convention as ConvertersFAQStructuredData.jsx.
//
// Honesty note (same bar as ConverterStructuredData.jsx): exchangeRate/
// exchangeRateSpecification/convertedAmount are only included when a
// genuinely live `rate` was resolved server-side — never a fabricated
// or stale-looking number standing in for one that failed to load.
export default function AmountConverterStructuredData({
  amount,
  from,
  fromClass,
  to,
  toClass,
  rate,
  fetchedAt,
  pageUrl,
  siteUrl,
  faqs,
}) {
  const hasRate = Number.isFinite(rate);
  const convertedAmount = hasRate ? amount * rate : null;

  const financialProduct = {
    "@type": "FinancialProduct",
    name: `${amount} ${from.code} to ${to.code} Converter`,
    description: `Convert ${amount} ${from.name} (${from.code}) to ${to.name} (${to.code}) using live exchange rates.`,
    category: "Currency Converter",
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "OmniFin Portal",
      url: siteUrl,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "amount", value: amount },
      { "@type": "PropertyValue", name: "baseAsset", value: from.code },
      { "@type": "PropertyValue", name: "baseAssetClass", value: fromClass },
      { "@type": "PropertyValue", name: "quoteAsset", value: to.code },
      { "@type": "PropertyValue", name: "quoteAssetClass", value: toClass },
      ...(hasRate
        ? [
            { "@type": "PropertyValue", name: "exchangeRate", value: rate },
            { "@type": "PropertyValue", name: "convertedAmount", value: convertedAmount },
          ]
        : []),
      ...(fetchedAt
        ? [{ "@type": "PropertyValue", name: "exchangeRateAsOf", value: fetchedAt }]
        : []),
    ],
    // ExchangeRateSpecification is the schema.org type built
    // specifically for "here's the rate behind this conversion" —
    // nested directly on the FinancialProduct rather than only buried
    // in additionalProperty above, since this is the structured
    // field Google's documentation points to for currency-conversion
    // rich results.
    ...(hasRate
      ? {
          exchangeRateSpecification: {
            "@type": "ExchangeRateSpecification",
            currency: to.code,
            currentExchangeRate: {
              "@type": "UnitPriceSpecification",
              price: rate,
              priceCurrency: to.code,
            },
          },
        }
      : {}),
  };

  const webApplication = {
    "@type": "WebApplication",
    name: "OmniFin Portal Currency Converter",
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
