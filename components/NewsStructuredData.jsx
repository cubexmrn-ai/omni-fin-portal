// components/NewsStructuredData.jsx
//
// JSON-LD for /ai-news, built from the same live `items` array
// app/ai-news/page.jsx already fetched via lib/newsAggregator.js's
// getAggregatedNews() and passed to components/NewsFeed.jsx — never a
// second data source, so this can never drift out of sync with what's
// actually rendered on the page.
//
// IMPORTANT — why this is an ItemList of NewsArticle *references*,
// not a page-level NewsArticle: every headline here is a third-party
// article from an external outlet (Yahoo Finance, MarketWatch, CNBC,
// FXStreet, CoinDesk, Cointelegraph, OilPrice — see
// lib/newsAggregator.js's NEWS_SOURCES) that OmniFin Portal links to,
// not an article OmniFin wrote or publishes. Marking this page itself
// up as a NewsArticle authored/published by OmniFin would misrepresent
// who actually wrote the content — each entry's `publisher` below is
// the real originating outlet (`item.source`), never OmniFin Portal,
// and `url` points at the original article, not this page. This is
// the same honesty bar as every other structured-data file in this
// project: describe real, verifiable data only.
//
// Capped to the first MAX_ITEMS entries actually visible on the page
// (NewsFeed renders all of `items`, but a JSON-LD block doesn't need
// to restate all 60+ to be useful/valid).

const MAX_ITEMS = 25;

export default function NewsStructuredData({ items }) {
  const list = (items || []).filter((item) => item?.title && item?.link).slice(0, MAX_ITEMS);
  if (list.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OmniFin Portal — Live Financial News Feed",
    description:
      "Live finance headlines aggregated from multiple outlets across Forex, Crypto, Commodities and Stocks.",
    itemListElement: list.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: item.title,
        url: item.link,
        ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
        ...(item.excerpt ? { description: item.excerpt } : {}),
        publisher: {
          "@type": "Organization",
          name: item.source,
        },
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
