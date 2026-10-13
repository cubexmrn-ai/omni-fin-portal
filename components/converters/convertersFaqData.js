// components/converters/convertersFaqData.js
//
// Single source of truth for /converters' visible FAQ accordion
// (rendered by components/FAQAccordion.jsx in
// components/ConvertersWorkspace.jsx... actually rendered directly
// from app/converters/page.jsx, see that file) AND its FAQPage JSON-LD
// (components/converters/ConvertersFAQStructuredData.jsx) — one array
// feeds both, so the structured data can never claim an answer the
// page doesn't actually show.
//
// Every figure below is a real constant already used by the live
// converters, not a new claim invented for this copy:
//   - Hourly rate refresh: lib/marketData.js's RATES_REVALIDATE_SECONDS
//     (3600s) / lib/fetchRates.js's matching constant.
//   - Tola = 11.6638038 g, Marla = 272.25 sq ft, Kanal = 20 marla
//     (5445 sq ft), Maund = 37.3242 kg: lib/conversionMath.js's
//     WEIGHT_UNITS/AREA_UNITS factor tables.
//   - 144+ currencies, 6 metals/commodities: lib/currencies.js /
//     lib/commodities.js (also the figures already quoted in this
//     page's own metadata description and the homepage's ecosystem copy).

export const CONVERTERS_FAQS = [
  {
    question: "How often are the exchange rates updated?",
    answer:
      "Fiat currency, crypto, and metals & commodities rates all refresh at least once every hour. Rates are fetched from live providers and cached for that hour to stay within free API rate limits, then automatically refreshed — so a rate you see is never more than about 60 minutes old.",
  },
  {
    question: "What can I convert on this page?",
    answer:
      "144+ fiat currencies, major cryptocurrencies (Bitcoin, Ethereum and others), 6 precious metals & commodities (gold, silver, platinum, palladium, copper and crude oil), and a full worldwide unit converter spanning length, area, weight, volume, speed, data and temperature — including South Asian units like Tola, Maund, Marla and Kanal alongside metric and imperial ones.",
  },
  {
    question: "What is a Tola, and how many grams is it?",
    answer:
      "A Tola is a traditional South Asian unit of mass used mainly for gold and silver. One Tola equals 11.6638038 grams. The Metals & Commodities converter uses this exact figure, so a gold price quoted per Tola matches what local jewellers and bullion markets in Pakistan, India and Bangladesh use.",
  },
  {
    question: "What are Marla and Kanal, and how do they convert to square feet?",
    answer:
      "Marla and Kanal are units of land area used across Pakistan and North India. One Marla equals 272.25 square feet, and one Kanal equals 20 Marla — 5,445 square feet. The Unit Converter's Area category converts between these and square feet, square meters, acres, hectares and more.",
  },
  {
    question: "Is this converter free to use?",
    answer:
      "Yes. Every converter on this page — currency, crypto, metals & commodities, and units — is completely free, with no account, sign-up, or paid tier required.",
  },
];
