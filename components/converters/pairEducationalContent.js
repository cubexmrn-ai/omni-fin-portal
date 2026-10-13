// components/converters/pairEducationalContent.js
//
// Replaces app/converters/[pair]/page.jsx's old single generic "About
// this pair" paragraph (identical boilerplate regardless of which two
// assets were involved) with real, asset-class-aware educational
// content — genuinely different copy for a fiat<->fiat pair vs. a
// crypto<->fiat pair vs. a metals<->fiat pair, since what's actually
// true and useful to say differs by class: forex market hours and
// quoting convention, crypto's 24/7 trading and higher volatility, and
// metals' troy-ounce/gram/tola pricing basis. This is what keeps the
// now much larger FEATURED_PAIRS list (lib/pairSlugs.js) from reading
// as duplicate boilerplate across 40+ pages — the page differs because
// the real content differs, not because of per-pair filler text.
//
// No invented numbers: every fact here is a general, verifiable
// property of how that asset class trades, never a specific rate,
// percentage, or claim that would need to be kept up to date.

const CLASS_NOTES = {
  fiat: {
    marketNote:
      "the global foreign exchange (forex) market — the world's largest and most liquid financial market, open nearly 24 hours a day on weekdays across overlapping Asian, European and US trading sessions, though it's closed on weekends",
    quoteNote:
      "quoted as how many units of the second currency one unit of the first currency buys",
  },
  crypto: {
    marketNote:
      "cryptocurrency exchanges, which — unlike forex or stock markets — never close: trading runs 24 hours a day, 7 days a week, including weekends and holidays",
    quoteNote:
      "typically more volatile over short periods than fiat currency pairs, since crypto markets trade continuously and react immediately to news",
  },
  metals: {
    marketNote:
      "the global spot bullion market, where precious metals are traditionally priced per troy ounce (31.1034768 grams) in US dollars, then converted to other units and currencies",
    quoteNote:
      "also commonly quoted per gram or, in South Asian markets, per Tola (11.6638038 grams) — see OmniFin Portal's dedicated Metals & Commodities Calculator for those unit conversions",
  },
};

/**
 * Returns { intro, formulaNote } — two short paragraphs of genuinely
 * distinct, class-aware copy for a given pair, plus the universal
 * conversion formula (always true, regardless of asset class).
 */
export function getPairEducationalContent({ fromClass, toClass, from, to }) {
  const fromNotes = CLASS_NOTES[fromClass] || CLASS_NOTES.fiat;
  const toNotes = CLASS_NOTES[toClass] || CLASS_NOTES.fiat;

  // When both sides are the same class, state its market context once
  // rather than repeating the same sentence twice with different names.
  const sameClass = fromClass === toClass;

  const intro = sameClass
    ? `${from.name} (${from.code}) and ${to.name} (${to.code}) both trade on ${fromNotes.marketNote}. This rate is ${fromNotes.quoteNote}.`
    : `${from.name} (${from.code}) trades on ${fromNotes.marketNote}, while ${to.name} (${to.code}) trades on ${toNotes.marketNote}. OmniFin Portal's live rates feed bridges both, so this conversion updates the same way whichever side you're converting from.`;

  return {
    intro,
    formulaNote:
      "Result = Amount × Exchange Rate. The rate shown above is 1 " +
      from.code +
      " in " +
      to.code +
      " — multiply any amount by that rate to convert, or divide by it to convert the other direction.",
  };
}
