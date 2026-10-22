// components/converters/BaseDigestStructuredData.jsx
//
// JSON-LD for a "/converters/<base-code>" rate-digest page (e.g.
// /converters/usd, /converters/pkr) — previously the ONLY structured
// data on this page branch was BreadcrumbStructuredData (see
// app/converters/[pair]/page.jsx's BaseCurrencyDigestPage), despite
// this being a real page type already receiving search impressions
// (the Oct 2026 GSC export shows /converters/usd at 9 impressions,
// position 42). A FinancialProduct (describing the digest tool
// itself) plus an ItemList of ExchangeRateSpecification entries for
// the top rows — Google's own documented type for "here's a rate" —
// closes that gap using the exact same honesty bar as every other
// structured-data file in this project: a row is only included when
// its rate actually resolved, never a fabricated or stale-looking
// number.
export default function BaseDigestStructuredData({ baseCode, baseName, rows, pageUrl, siteUrl, fetchedAt }) {
  const validRows = rows.filter((r) => Number.isFinite(r.rate)).slice(0, 25);

  const financialProduct = {
    "@type": "FinancialProduct",
    name: `${baseName} (${baseCode}) Exchange Rate Digest`,
    description: `Live ${baseName} (${baseCode}) exchange rate against every currency OmniFin Portal supports.`,
    category: "Currency Rate Digest",
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "OmniFin Portal",
      url: siteUrl,
    },
    ...(fetchedAt ? { dateModified: fetchedAt } : {}),
  };

  const itemList =
    validRows.length > 0
      ? {
          "@type": "ItemList",
          "@id": `${pageUrl}#rates`,
          name: `${baseCode} Exchange Rates`,
          numberOfItems: validRows.length,
          itemListElement: validRows.map((row, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "ExchangeRateSpecification",
              currency: row.code,
              currentExchangeRate: {
                "@type": "UnitPriceSpecification",
                price: row.rate,
                priceCurrency: row.code,
              },
            },
          })),
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [financialProduct, ...(itemList ? [itemList] : [])],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
