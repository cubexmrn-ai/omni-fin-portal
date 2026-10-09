// components/ConverterStructuredData.jsx
//
// JSON-LD structured data for a converter SEO page
// (app/converters/[pair]/page.jsx) — a FinancialProduct (describing the
// specific pair, with its current rate as an additionalProperty when
// one is available) plus a WebApplication (describing the converter
// tool itself). Rendered as one <script type="application/ld+json">
// using "@graph" so both entities share one @context.
//
// Honesty note (same bar as the rest of this project): if `rate` is
// null (live rate genuinely unavailable right now), the exchangeRate
// property is simply omitted — never a fabricated or stale-looking
// number dressed up as current. No aggregateRating/review fields are
// included anywhere here either, since this project has no real review
// data to back one.
export default function ConverterStructuredData({
  from,
  fromClass,
  to,
  toClass,
  rate,
  fetchedAt,
  pageUrl,
  siteUrl,
}) {
  const financialProduct = {
    "@type": "FinancialProduct",
    name: `${from.code} to ${to.code} Converter`,
    description: `Convert ${from.name} (${from.code}) to ${to.name} (${to.code}) using live exchange rates.`,
    category: "Currency Converter",
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "OmniFin Portal",
      url: siteUrl,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "baseAsset", value: from.code },
      { "@type": "PropertyValue", name: "baseAssetClass", value: fromClass },
      { "@type": "PropertyValue", name: "quoteAsset", value: to.code },
      { "@type": "PropertyValue", name: "quoteAssetClass", value: toClass },
      // Only included when a genuinely live rate was resolved server-side
      // — see the big comment above.
      ...(Number.isFinite(rate)
        ? [{ "@type": "PropertyValue", name: "exchangeRate", value: rate }]
        : []),
      ...(fetchedAt
        ? [{ "@type": "PropertyValue", name: "exchangeRateAsOf", value: fetchedAt }]
        : []),
    ],
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [financialProduct, webApplication],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
